const getAbuseData = require('../services/abusedbService').getAbuseData;
const ping = require('../services/ping').pingIP;
const checkCommonPorts = require('../services/checkPorts').checkCommonPorts;
const checkIP = require('../services/validation');
const Message = require('../services/messageObj').Message;
const isIpBlocked = require('../services/blocklistRequest').isIpBlocked


exports.handleData = async (req, res) => {
    const ip = req.query.q;


    var ipRequestData = new Message(ip)

    if (!checkIP.validateIP(ip)) {
        ipRequestData.message = "Invalid IP address format";
        return res.json(ipRequestData);
    }

    if (await checkBlockList(ip)) {
        ipRequestData.inBlocklist = true

    } else {
        ipRequestData.inBlocklist = false
    }


    const pingResult = await ping(ip);
    console.log(    `Ping result for ${ip}: ${pingResult}`);
    ipRequestData.pingStatus = pingResult;
    ipRequestData.commonPorts = await checkCommonPorts(ip);




    abusedDBData(ipRequestData)
        .then((abuseData) => {
            if (abuseData) {
                ipRequestData = abuseData;

            } else {
                ipRequestData.message = "No abuse data found for this IP";
            }
            res.json(ipRequestData);
        })
        .catch((error) => {
            ipRequestData.message = "Error fetching abuse data";
            res.status(500).json(ipRequestData);
        }
        );

}


const abusedDBData = async (msgObj) => {
    try {
        const abuseData = await getAbuseData(msgObj.ip);
        msgObj.countryCode = abuseData.data["countryCode"];
        msgObj.domain = abuseData.data["domain"];
        msgObj.abuse = abuseData.data["abuseConfidenceScore"];
        msgObj.isPublic = abuseData.data["isPublic"];
        msgObj.isp = abuseData.data["isp"];

        return msgObj;
    } catch (error) {
        console.error('Error fetching abuse data:', error);
        throw error;
    }
}

const checkBlockList = async (ip) => {
    return await isIpBlocked(ip);
}





