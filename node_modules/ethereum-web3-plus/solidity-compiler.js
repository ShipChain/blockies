
//#########################################################################################
// ETHEREUM COMPILER FUNCTIONS
// Created by G. de Cadoudal - march 2017
// creates a cache of the contracts, allow compilation and loading from local folder
//#########################################################################################
var path=require('path');
var SolidityCompiler = function(web3) {
	this.web3 = web3; // instance of the connection to the geth node
	this.DeployedLib = {} ; // a map of library name to their deployed address
	this.DictContract= {} ; // a map with the result of the compilation and what is needed for the initialization
	this.LibToken={}; // a map of the library name to their token in the compiled class to do the replacing
	this.MissingLibs={}; // a map with the tokens found in the code after replacement
}
SolidityCompiler.prototype.compile = function(sourceFile) {
	this.compileInline('import "'+sourceFile+'";');
}

SolidityCompiler.prototype.extractMissingLibs = function() {
    this.MissingLibs={};
	var reLib = /__.*?:.*?__+/g;
	for(let name in this.DictContract) {
		var m=reLib.exec(this.DictContract[name].code);
		while(m) {
			if(!this.MissingLibs[m[0]]) this.MissingLibs[m[0]]={count:0, contracts:[]};
			this.MissingLibs[m[0]].count++;
			if(this.MissingLibs[m[0]].contracts.indexOf(name)<0)
				this.MissingLibs[m[0]].contracts.push(name);
			m = reLib.exec(m["input"]); // find next
		}
    }	
}

SolidityCompiler.prototype.linkAll = function() {
    // restart from the unlinked code
    for(let name in this.DictContract)
        this.DictContract[name].code=this.DictContract[name].unlinkedCode;    
    // starts by updating MissingLibs in the code
    this.extractMissingLibs(); 
    // for each missing lib, see if one deployed lib match the token, if so keep the address
    for(let missing in this.MissingLibs) {
        let parts = missing.split(':');
        for(let deployed in this.DeployedLib) {
            let token = ('__'+(parts[0].substr(2)+':'+deployed).substr(0,36)+'_'.repeat(40)).substr(0,40);
            if(missing==token) this.MissingLibs[missing].address = this.DeployedLib[deployed];
        }
    }

	// replacing the missing tokens with their address in compiled contract
    for(let missing in this.MissingLibs) {
        if(!this.MissingLibs[missing].address) continue; // this missing lib has not been found
        let list = this.MissingLibs[missing].contracts;
        let rex=RegExp(missing, "g"); // match "__<source of the lib cut at 36 char>__"
        for(let i=0; i<list.length; i++)
            this.DictContract[list[i]].code=this.DictContract[list[i]].code.replace(rex, 
                                                this.MissingLibs[missing].address.replace("0x",""));
    }	
    
    // Now update the missing libs after this linking pass
    this.extractMissingLibs(); 
}
SolidityCompiler.prototype.addContract = function(contract, abi, code) {
		if(!abi) throw new Error("Missing abi description for "+contract);
		this.DictContract[contract] = {
			abi:abi,
			contract:this.web3.eth.contract(abi)
		};
		if(code) {
			this.DictContract[contract].unlinkedCode=code;
			this.DictContract[contract].code=code;			
		}
}
SolidityCompiler.prototype.compileInline = function(sourceInline) {
	var eth=this.web3.eth;
	var compiled = eth.compile.solidity(sourceInline);
	for( var obj in compiled ) {
		var name=obj.split(":")[1];
        this.LibToken[name]= ("__"+obj.substr(0,36)+"_".repeat(38)).substr(0,40); // 40 is the size of the target address
		this.addContract(name, compiled[obj].info.abiDefinition, compiled[obj].code);
	}
	this.linkAll();
}

const solidityFolder = path.resolve(process.cwd(),".ethereum_contracts");
// save the ABI and Code (unlinked) to a folder for reloading without compilation
SolidityCompiler.prototype.persist = function() {
	const fs=require("fs");
	if(! fs.existsSync(solidityFolder)) fs.mkdirSync(solidityFolder);
	if(! fs.existsSync(solidityFolder)) throw new Error("impossible to create the contract folder");
	const self=this;
	Object.keys(this.DictContract).forEach(function(contract) {
		// same format generation as what solc --bin --abi Contract.sol would generate.
		fs.writeFileSync(path.resolve(solidityFolder, contract+".abi"), JSON.stringify(self.DictContract[contract].abi));
		fs.writeFileSync(path.resolve(solidityFolder, contract+".bin"), self.DictContract[contract].unlinkedCode.substr(2));
	});
}

function resolveFile(basefolder, contract) {
    const fs=require("fs");
	// check contract exists as is in the folder
	if (fs.existsSync(path.resolve(basefolder,contract+".abi")) ) return contract;
	// if not check if there is a file that ends with the contract name. solcjs does prefix the files with the solidity file name and I want to ignore this
	files=fs.readdirSync(basefolder);
    files=files.filter( file => file.endsWith('_'+contract+'.abi') );
    if (files.length>0) return files[0].replace('.abi',''); else return null;
} 

SolidityCompiler.prototype.load = function(contract) {
	const fs=require("fs");
	if(! fs.existsSync(solidityFolder)) throw new Error("a folder "+solidityFolder+" is expected to locate the contract abi and binary" );
	const contractFile = resolveFile(solidityFolder, contract);
	if(!contractFile) throw new Error("check you have compiled contract "+contract+"!");
	const abifile = path.resolve(solidityFolder,contractFile+".abi");
	if(fs.existsSync(abifile)) {
		const abi = JSON.parse(fs.readFileSync(abifile));
		this.DictContract[contract] = {
			abi:abi,
			contract:this.web3.eth.contract(abi),
            unlinkedCode:'0x',
            code:'0x'
		};
		//this.LibToken[contract]= ("__"+obj.substr(0,36)+"_".repeat(38)).substr(0,40); // 40 is the size of the target address
		const binfile= path.resolve(solidityFolder, contractFile+".bin");
		if(fs.existsSync(binfile)) {
			const code="0x"+fs.readFileSync(binfile).toString();
			this.DictContract[contract].unlinkedCode=code;
			this.DictContract[contract].code=code;
			this.linkAll(); // will change the DictContract[contract].code if needed
		} else console.log("WARNING: Evm code not found, you will not be able to create new instances: "+binfile);
	} else throw new Error("Could not find the "+abifile+" file");
}
SolidityCompiler.prototype.require = function(contract) {
	if(! this.DictContract[contract]) 
		this.load(contract);
	return this.DictContract[contract];
}
SolidityCompiler.prototype.displaySizes = function() {
	for(e in this.DictContract)
		console.log("Compiled", e, "code length:", this.DictContract[e].code.length-2); // remove length of "0x"
}
SolidityCompiler.prototype.displayMissingLibs = function() {
	for(l in this.MissingLibs)
		console.log("Missing library:", l, "in", this.MissingLibs[l].contracts.join(", "));
}
SolidityCompiler.prototype.addDeployedLib = function(lib, address) {
	if(!lib) return false;
	if(!address) return delete this.DeployedLib[lib];
	
	this.DeployedLib[lib]=address;
	return true;
}
SolidityCompiler.prototype.displayDeployedLibs = function() {
	for(l in this.DeployedLib)
		console.log("Library", l, ":",this.DeployedLib[l]);
}
SolidityCompiler.prototype.getCode = function(contract) {
	if(!contract) return null;
	try {
        return this.require(contract).code;
    } catch (error) {
		console.error("Failed loading contract "+contract+" due to error "+error)
        return null;
    }
}
SolidityCompiler.prototype.getContract = function(contract) {
	if(!contract) return null;
	try {
        return this.require(contract).contract;
    } catch (error) {
		console.error("Failed loading contract "+contract+" due to error "+error)
        return null;
    }
}

module.exports = SolidityCompiler;