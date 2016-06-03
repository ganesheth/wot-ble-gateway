"use strict";

var noble = require('noble');

var Hapi = require('hapi');

var routes = require('./routes');

var async =require('async');

var chat = {
    "#channel": {
        open: true,
        'say-"hello"': function (msg) {}
    }
};



var host = 'localhost:8001';





var server = new Hapi.Server();

server.connection({
  port: 8001
});

server.route(routes);

server.app.peripherals = [];
server.app.services = [];
server.app.characteristics = [];
server.app.characteristic_values = [];
server.app._characteristics = {};
server.app.descriptors = [];

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning()
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log("found a node: ", peripheral.address);

  server.app.peripherals.push(peripheral);
  server.app.characteristics[peripheral.address] = {};
  server.app.characteristic_values[peripheral.address] = {};
  server.app._characteristics[peripheral.address] = {};
  server.app.services[peripheral.address] = [];
  server.app.descriptors[peripheral.address] = {};
})

noble.on('scanStart', function() {
  console.log('Scanning for BLE Devices (for next 5 seconds)');
  setTimeout(function() {
    noble.stopScanning();
  }, 5 * 1000);
})

noble.on('scanStop', function() {         
  console.log('Scanning stopped');
  mapPeripherals();
});

function mapPeripherals() {
  server.app.peripherals.map(function(peripheral){
    peripheral.connect(function(error) {
      if (error){
        console.log(error);
      }
      async.waterfall([
          function(callback){
            // Get services
			console.log('Disconvering services for ');
			console.log(peripheral.address);
            peripheral.discoverServices([],function discoverSvcCB(error, services){
              services.forEach(function(service){
                  server.app.services[peripheral.address].push({
                    "uuid": service.uuid,
                    "handle": service.name 
                  })
                  server.app.characteristics[peripheral.address][service.uuid] = [];
                  server.app.characteristic_values[peripheral.address][service.uuid] = {};
                  server.app._characteristics[peripheral.address][service.uuid] = {};
                  server.app.descriptors[peripheral.address][service.uuid] = {};
                });
				console.log('..done\n');
                callback (error, services);   
            })
          },
          
          function discoverChars(services,callback){
            //Get chars
          
            services.forEach(function(service){
				console.log('Disconvering characterisitics for ');
				console.log(service.uuid);
              service.discoverCharacteristics([],function discoverCharCB(error, characteristics){
                
                characteristics.forEach(function(characteristic){
                  console.log(' save char:  '+ characteristic.uuid);
                  
                  server.app.descriptors[peripheral.address][service.uuid][characteristic.uuid] = [];
                  
                  server.app._characteristics[peripheral.address][characteristic._serviceUuid][characteristic.uuid] = characteristic;
              
				  var ds = []
				  characteristic.discoverDescriptors(function(error, descriptors){
                    descriptors.forEach(function(descriptor){
					  var descLinks = []
					  descLinks.push({"href" : descriptor.uuid + "/value", "rel": "read", "method":"GET"})
					  descLinks.push({"href" : descriptor.uuid + "/value", "rel": "update", "method":"PUT"})
					  var d = {"name": descriptor.name, "uuid": descriptor.uuid, "type":descriptor.type, "@type":"BLE:Descriptor", "_links" : descLinks}
					  ds.push(d);
                      server.app.descriptors[peripheral.address][service.uuid][characteristic.uuid] = 
                      console.log(server.app.descriptors[peripheral.address][service.uuid][characteristic.uuid]);
                    })
				  });
				  
				  var charLinks = []
				  for(var i in characteristic.properties){
					var prop = characteristic.properties[i]
					if(prop == "read")
						charLinks.push({"href" : characteristic.uuid + "/value", "rel": prop, "method":"GET"})
					if(prop == "write")
						charLinks.push({"href" : characteristic.uuid + "/value", "rel": prop, "method":"PUT"})
					if(prop == "notify" || prop == "indicate")
						charLinks.push({"href" : characteristic.uuid + "/value", "rel": prop, "method":"GET"}	)					
				  }
				  
                  server.app.characteristics[peripheral.address][characteristic._serviceUuid].push({
                    "name"     : characteristic.name,
                    "@id"       : characteristic.uuid,
					"@type" : "BLE:Characterstic",
					"type" : characteristic.type,
                    "_links" : charLinks,
					"properties" : ds
                  });
				  
                });
				console.log('..done\n');
              });
            });
			callback(error, peripheral);
          },
		  function disconnect(peripheral, callback){		  
			setTimeout(function() {peripheral.disconnect(function(error){	console.log('Disconnect called');});}, 5 * 1000);			
		  },
       
      ],function(error){
        //close connection
        peripheral.disconnect(function(error){
          console.log('Disconnect called');
        });
      }) 
    });  
  })
}


/** @description Start server.
 */
server.start();
