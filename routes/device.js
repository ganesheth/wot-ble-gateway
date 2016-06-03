module.exports = [
  {
    method: 'GET',
    path:'/ble/devices/{node_id}',
    handler: function (request, reply) {
      var services_json = [];
      var node_uuid = request.params.node_id;

      request.server.app.peripherals.map(function(peripheralString) {
        peripheral = JSON.parse(peripheralString);
        if (peripheral.address === node_uuid) {
		
		 var device = {				
				"@type" : "BLE:Device",
				"@id" :  peripheral.id,
				"advertisement" : peripheral.advertisement,
				"bdaddrs": [
				{
				  "bdaddr" : peripheral.address,
				  "bdaddrType" : peripheral.addressType
				},],
				"rssi" : peripheral.rssi,
				"AD": [{ "ADType" : "<type1>", "ADValue" : " <value1>"}	],
				"_links": []
			};
          var services = request.server.app.services[peripheral.address]

          if (services && services.length) {
            for (var i in services) {
              var service = services[i];

              var service_json = {
                "href" : "http://" + request.headers.host + "/ble/devices/" + peripheral.address + "/" + service.uuid,
                "handle"  : service.handle,
                "@id"      : service.uuid,
				"targetType" : "BLE:Service"
              }
              device._links.push(service_json);
            }
          }
		  reply(device);
        }
      });      
    }
  }
]
