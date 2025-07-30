const getAbuseData = require('../services/abusedbService').getAbuseData;
const ping = require('../services/ping').pingIP;
const tcping = require('../services/tcping').tcping;
const checkIP = require('../services/validation');
const Message = require('../services/messageObj').Message;


exports.handleData = async (req, res) => {
    const ip = req.params.ip;

    var ipRequestData = new Message(ip)

    if (!checkIP.validateIP(ip)) {
        ipRequestData.message = "Invalid IP address format";
        return res.json(ipRequestData);
    }



    if (!checkIP.checkIfIPisPrivate(ip)) {
        const pingResult = await ping(ip);
        ipRequestData.pingStatus = pingResult;
    } else {
        ipRequestData.pingStatus = false;
        ipRequestData.message = "Private IP addresses cannot be pinged";
    }

    try {
        ipRequestData.tcpPingStatus = await tcping(ip);
    } catch {
        ipRequestData.tcpPingStatus = false;
    }



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
            console.error('Error fetching abuse data:', error);
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
        msgObj.ips = abuseData.data["isp"];

        return msgObj;
    } catch (error) {
        console.error('Error fetching abuse data:', error);
        throw error;
    }
}





