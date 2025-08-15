const net = require('net');

// generischer Port-Check
function checkPort(ip, port, timeout = 250) {
    return new Promise((resolve) => {
        console.log(ip)
        const socket = new net.Socket();
        let isOpen = false;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            isOpen = true;
            socket.destroy();
        });

        socket.on('timeout', () => {
            socket.destroy();
        });

        socket.on('error', () => {
            socket.destroy();
        });

        socket.on('close', () => {
            resolve(isOpen);
        });

        socket.connect(port, ip);
    });
}


exports.checkCommonPorts = async (ip) => {
    console.log(`Checking common ports on ${ip}...`);

    const results = await Promise.all([
        checkPort(ip, 80),  // HTTP
        checkPort(ip, 22),  // SSH
        checkPort(ip, 53)   // DNS
    ]);

    return {
        port80: results[0],
        port22: results[1],
        port53: results[2]
    };
};
