import axios from "axios";
import EvaluatedIpData from "../structs/EvaluatedIpData";


const FetchOXL = async (ip: string): Promise<EvaluatedIpData> => {
    try {
        const response = await axios.get(`https://geoip.oxl.app/api/ip/${encodeURIComponent(ip)}`);
        const data = response.data;

        const evaluatedData: EvaluatedIpData = {
            ip,
            abuse: data.contacts?.noc?.email || "",        // Abuse email von NOC
            abuseMail: data.contacts?.noc?.email || undefined,
            ping: false,                                   // ping nicht aus API verfügbar, Default false
            commonPorts: [],                               // Ports nicht aus API, leer lassen
            inBlocklist: false,                            // nicht aus API, Default false
            hostname: undefined,                           // nicht verfügbar                        // nicht verfügbar
            location: data.organization.country,
            org: data.organization?.name || data.info?.name || undefined,
            company: data.organization?.name || undefined,
            asn: data.asn?.toString() || undefined,
            nat: false                                     // nicht verfügbar, Default false
        };

        return evaluatedData;
    } catch (error) {
        console.error("Error fetching IP data:", error);
        return {
            ip,
            abuse: "",
            ping: false,
            commonPorts: [],
            inBlocklist: false,
            location: "",
        };
    }

};


export default FetchOXL;

