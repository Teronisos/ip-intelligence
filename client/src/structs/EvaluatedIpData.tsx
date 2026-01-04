type CommonPorts = {
    port: number | string;
    open: boolean;
};

 type EvaluatedIpData = {
    onClose?: () => void;
    ip: string;
    abuse: string;
    ping: string | boolean;
    commonPorts: CommonPorts[];
    inBlocklist: boolean | string;
    hostname?: string;
    location: string;
    org?: string;
    company?: string;
    abuseMail?: string;
    asn?: string;
    nat?: boolean;
};


export default EvaluatedIpData;