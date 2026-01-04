import axios from "axios";
import EvaluatedIpData from "../structs/EvaluatedIpData";


const FetchOXL = async (ip: string): Promise<EvaluatedIpData> => {
    try {
        const response = await axios.get(`https://geoip.oxl.app/api/ip/${encodeURIComponent(ip)}`);
        const data = response.data;

        const evaluatedData: EvaluatedIpData = {
            ip,
            abuse: data.contacts?.noc?.email || "",      
            abuseMail: data.contacts?.noc?.email || undefined,
            ping: false,                                 
            commonPorts: [],                          
            inBlocklist: false,                           
            hostname: undefined,                                              
            country: data.organization.country,
            org: data.organization?.name || data.info?.name || undefined,
            company: data.organization?.name || undefined,
            asn: data.asn?.toString() || undefined,
            nat: false                                     
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
            country: "",
        };
    }

};


export default FetchOXL;

