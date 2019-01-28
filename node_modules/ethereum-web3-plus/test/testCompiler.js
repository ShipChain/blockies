var Web3 = require('web3');
require('../index.js');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.solidityCompiler(); // initialize

web3.solidityCompiler.addDeployedLib("MapString", "0x48f59e9fbce7880a11acd90dc2f99b28accc47f6");
web3.solidityCompiler.addDeployedLib("MapAddressWithProps", "0x87614301dd92d49447b926941940c85533b7e147");
console.log("Command line:\n", process.argv);
if(process.argv.pop()=='--dev') {
    web3.solidityCompiler.compile("./sources/SyndicationPoc_2.sol");
    web3.solidityCompiler.displaySizes();
    web3.solidityCompiler.displayMissingLibs();

    web3.solidityCompiler.persist();
}
//let AR = web3.solidityCompiler.require("AgreementRegister");
//console.log("Loaded:", AR);
//console.log("Solo:",web3.solidityCompiler.require("Solo"));


web3.eth.defaultAccount=web3.eth.coinbase;
web3.BlockWatcherStart();
web3.waitFor( web3.newInstanceTx("AgreementRegister",0), 
                function(tx, contract, error) {
                    console.log("New Contract created : ", contract, "Error:",error);
                }
    );
    