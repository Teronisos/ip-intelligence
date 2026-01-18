const net = require('net');
const dgram = require('dgram');

const FAST_TIMEOUT = 500;

const checkTcp = (ip, port) => new Promise((resolve) => {
    const socket = new net.Socket();


    socket.unref();
    socket.setTimeout(FAST_TIMEOUT);

    const finish = (status) => {
        socket.destroy();
        socket.removeAllListeners();
        resolve(status);
    };

    socket.on('connect', () => finish(true));
    socket.on('timeout', () => finish(false));
    socket.on('error', () => finish(false));

    socket.connect(port, ip);
});


const checkUdp = (ip, port) => new Promise((resolve) => {
    const client = dgram.createSocket('udp4');
    client.unref();


    const payloads = {
        123: Buffer.from([0x1B, ...new Array(47).fill(0)]), // NTP Client Mode
        53: Buffer.from('\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x03www\x06google\x03com\x00\x00\x01\x00\x01') // DNS Query
    };

    const message = payloads[port] || Buffer.alloc(1);

    const timer = setTimeout(() => {
        client.close();
        resolve(false);
    }, FAST_TIMEOUT);

    client.on('message', () => {
        clearTimeout(timer);
        client.close();
        resolve(true);
    });

    client.on('error', () => {
        clearTimeout(timer);
        client.close();
        resolve(false);
    });

    client.send(message, 0, message.length, port, ip);
});

exports.checkCommonPorts = async (ip) => {

    const tasks = [
        checkTcp(ip, 80),  // HTTP
        checkTcp(ip, 22),  // SSH
        checkUdp(ip, 53),  // DNS (UDP)
        checkUdp(ip, 123)  // NTP (UDP)
    ];

    const [p80, p22, p53, p123] = await Promise.all(tasks);

    return {
        port80: p80,
        port22: p22,
        port53: p53,
        port123: p123,
    };
};




