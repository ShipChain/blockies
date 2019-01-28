//#########################################################################################
// ETHEREUM FUNCTIONS
// Created by G. de Cadoudal - march 2017
// adds functions and objects to the web3 instance by modifying Web3 prototype
//#########################################################################################


var isArray = function (object) {
	return object instanceof Array;
};

var removeDuplicates = function(array) {
	if(! isArray(array) ) return array;
	if(array.length<=1) return array;
	var result=[];
	for(var i=0; i<array.length; i++)
		if(result.indexOf(array[i])==-1)
			result.push(array[i]);
	return result;
}

var processEventNames = function(web3, ContractDotEvents) {
	if( isArray(ContractDotEvents) )
		return removeDuplicates(ContractDotEvents).map(function(ev){return processEventNames(web3, ev)}).filter(function(e){ return e;} );
	
	if( typeof ContractDotEvents !== 'string') return null;
	var parts = ContractDotEvents.split(".");
	if( parts.length != 2 ) return null; // the provided syntax is not Class.Event
	var instance = web3.instanceAt(parts[0], undefined); // create a generic object on the class with no address
	if(!instance) return null; // the class name does not exists
	if(!instance[parts[1]]) return null; // the event name does not exists
	
	return {contractName: parts[0], eventName: parts[1], instance: instance};
}

// this class will contains the logic for subscribing to event logs in the chain and reload historical events
// the subscription should be simplified compared to web3 class by allowing the use of
// events to subscribe on: "Contract.Event" that will be resolved by using the solidityCompiler class
// event to be filtered on: - topic 2, 3 and 4 according to the event business logic
//                          - from and to of the transaction (to be checked how web3 handles this)
// fromBlock used to reload historical blocks
// a processing callback to receive the log js object (interpreted)
//      and with an indicator "new" : true/false to differentiate reloaded and new events
EventSynchronizer = function(web3, ContractDotEvents, filters) {
	// this is a master class. All inline code is not transmitted to the instances
	// all this.variable objects are available to the instances and can be redefined for each if needed
	// class.prototype.xxx will define attributes and function of the instances
	
	this.filters = filters || {}; //
	
	// array of {contractName:"name", eventName:"name", instance:I)
	this.events = [].concat(processEventNames(web3, ContractDotEvents));
	this.web3Filters = []; // an array of Filters being watched
	this.historyToBlock = 0; // used to break the reading between history and watching
}

// bound to the a created object {callback: cb, contractName:"name", isNew:true }
var internalCallbackUnitary = function(error, log) {
	if(this.callback)
		if(error) this.callback(error, null);
		else {
			log.isNew=this.isNew;
			log.contract=this.contractName;
			this.callback(null, log);
		}
}
var internalCallbackArray = function(error, logs) {
	var internalCallbackUnitaryBound = internalCallbackUnitary.bind(this);
	if( isArray(logs) ) logs.forEach(function(log){ internalCallbackUnitaryBound(error, log);});
	else internalCallbackUnitaryBound(error, logs);
	if(this.filter) this.filter.stopWatching(function(){}); // clear the filter
}

// callback must be function(Error, Log) Log is completed with contract, isNew, txSender, txTarget
EventSynchronizer.prototype.historyFromBlock = function(fromBlock, callback) {
	if(this.events.length==0) { if(callback) callback("No event registered!", null); return;}
	this.historyToBlock = this.events[0].instance._eth.blockNumber;
	var toBlock = (+this.historyToBlock);
	for(var i=0; i<this.events.length; i++) {
		var ev=this.events[i];
		var bound = {callback: callback, contractName: ev.contractName, isNew:false };
		var F = ev.instance[ev.eventName](this.filters, {fromBlock:fromBlock, toBlock:toBlock});
		bound.filter=F; // add it to the bound object so that the stopWatching can be called in the callback
		F.get( internalCallbackArray.bind(bound) );
	};
}

// returns a unique id that groups the subscriptions
EventSynchronizer.prototype.startWatching = function(callback) {
	// create the filter from historyToBlock+1
	if(this.events.length==0) if(callback) callback("No event registered!", null);
	if(this.historyToBlock==0) this.historyToBlock = this.events[0].instance._eth.blockNumber;
	var fromBlock = (+this.historyToBlock+1);
	for(var i=0; i<this.events.length; i++) {
		var ev=this.events[i];
		var bound = {callback: callback, contractName: ev.contractName, isNew:true };
		var F = ev.instance[ev.eventName](this.filters, {fromBlock:fromBlock, toBlock:'latest'});
		F.watch( internalCallbackUnitary.bind(bound) );
		this.web3Filters.push( F);
	};
}
EventSynchronizer.prototype.stopWatching = function() {
	while(this.web3Filters.length>0) {
		this.web3Filters.pop().stopWatching(function() {}); // run async and ignore the result
	}
}

module.exports = EventSynchronizer;
