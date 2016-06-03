module.exports = [
  {
    method: 'GET',
    path:'/ble/devices/{node_id}/{service_id}',
    handler: function (request, reply) {
      var node_uuid = request.params.node_id
      var service_uuid = request.params.service_id
      var td = {"properties" : request.server.app.characteristics[node_uuid][service_uuid]}
      reply(td);
    }
  }
]
