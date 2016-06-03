// var nodes = require('./nodes');
var nodes = require('./devices');
var services = require('./device');
//var descriptors = require('./descriptors');
var characteristics = require('./service');
var values = require('./values');

//module.exports = [].concat(nodes, services, characteristics, descriptors, values);
module.exports = [].concat(nodes, services, characteristics, values);
