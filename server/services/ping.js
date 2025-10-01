const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

exports.pingIP = async (ip) => {
    try {
        const { stdout } = await execAsync(`fping -r 0 -t 200 ${ip}`);
       
       //console.log("ping: ", stdout)
        if (stdout.includes('is alive')) {
            return true;
        }
        return false;
    } catch (error) {
        // if fping is unreachable Exit-Code != 0
        if (error.stdout && error.stdout.includes('is unreachable')) {
            return false;
        }

        
        console.error('Fehler bei fping:', error.message);
        return false;
    }
};
