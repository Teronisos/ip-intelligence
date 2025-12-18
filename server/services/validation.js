const net = require('net');

exports.validateIP = (ip) => {
    console.log("ip: ", ip)
    return net.isIP(ip) !== 0;
};