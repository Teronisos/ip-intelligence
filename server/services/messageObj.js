class Message {
    ip;
    isPublic;
    domain;
    isp;
    country;
    city;
    pingStatus;
    abuse;
    tcpPingStatus
    message;

    constructor(ip) {
        this.ip = ip;
    }
}

exports.Message = Message;
