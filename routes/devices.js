module.exports = [
  {
    method: 'GET',
    path:'/ble/devices',
    handler: function (request, reply) {
      var reply_json = request.server.app.peripherals.map(function(peripheralString) {
        peripheral = JSON.parse(peripheralString);
        console.log(peripheral)
        return {"href" : "http://" + request.headers.host + "/ble/devices/" + peripheral.address , "rel":"device"};
      });

      reply({"_links" : reply_json});
    }
  }
]
