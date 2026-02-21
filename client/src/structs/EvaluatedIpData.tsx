type CommonPorts = {
    port: number | string;
    open: boolean;
};

 type EvaluatedIpData = {
    ip: string;
    abuse: string;
    ping: string | boolean;
    commonPorts: CommonPorts[];
    inBlocklist: boolean | string;
    hostname?: string;
    country: string;
    org?: string;
    company?: string;
    abuseMail?: string;
    asn?: string;
    nat?: boolean;
    domain?: string;
};


export default EvaluatedIpData;