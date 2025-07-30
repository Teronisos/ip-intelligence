const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

exports.pingIP = async (ip) => {
    try {
        // fping -c 1 : exakt 1 ICMP Echo Request
        // -t 250    : Timeout in Millisekunden (analog zu deinem Wunsch)
        const { stdout } = await execAsync(`fping -c 1 -t 450 ${ip}`);
        return true;
    } catch (error) {
        //console.error('Ping failed:', error.message);
        return false;
    }
};
