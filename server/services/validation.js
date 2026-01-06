const net = require('net');

exports.validateIP = (ip) => {
    return net.isIP(ip) !== 0;
};