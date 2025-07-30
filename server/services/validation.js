
exports.validateIP = (ip) => {
    // regex ip validation
    console.log("validateIP called with:", ip);
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);

}

exports.checkIfIPisPrivate = (ip) => {
    // Check if the IP is in the private range
    const privateRanges = [
        /^10\./, // 10.0.0.0 - 10.255.255.255
        /^172\.1[6-9]\./, // 172.16.0.0 - 172.19.255.255
        /^172\.2[0-9]\./, // 172.20.0.0 - 172.29.255.255
        /^172\.3[0-1]\./, // 172.30.0.0 - 172.31.255.255
        /^192\.168\./ // 192.168.0.0 - 192.168.255.255
    ];

    return privateRanges.some(range => range.test(ip));
}
