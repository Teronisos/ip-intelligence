class Message {
    ip;
    isPublic;
    domain;
    isp;
    country;
    city;
    pingStatus;
    abuse;
    commonPorts
    message;
    inBlocklist;
    constructor(ip) {
        this.ip = ip;
    }
}

exports.Message = Message;
