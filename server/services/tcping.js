const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

exports.tcping = async (ip) => {
    const tcpingCommand = `tcping ${ip} 80`;

    // Timeout-Promise, das nach 250ms false zurückgibt
    const timeout = new Promise((resolve) => {
        setTimeout(() => resolve(false), 300);
    });

    // tcping-Ausführungspromise
    const tcpingPromise = execAsync(tcpingCommand)
        .then(() => true)
        .catch(() => false);

    // Der schnellere gewinnt: tcping oder Timeout
    return Promise.race([tcpingPromise, timeout]);
};
