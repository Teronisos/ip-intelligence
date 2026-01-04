import axios from "axios";
import EvaluatedIpData from "../structs/EvaluatedIpData"; 



const apiUrl = process.env.REACT_APP_API_URL;

const FetchBackendAPI = async (ip: string): Promise<EvaluatedIpData> => {
    const response = await axios.get(`${apiUrl}/api/ip`, { params: { q: ip } });
    const data = response.data;


    const commonPortsArray: EvaluatedIpData["commonPorts"] = data.commonPorts
        ? Object.entries(data.commonPorts).map(([port, isOpen]) => ({
            port: parseInt(port.replace("port", ""), 10),
            open: Boolean(isOpen),
        }))
        : [];

        console.log("Backend API data:", data.countryCode);

    return {
        ip: data.ip,
        hostname: data.domain || undefined,
        abuse: `Abuse: ${data.abuse ?? 0}%`,
        ping: data.pingStatus || false,
        country: data.countryCode || undefined,
        commonPorts: commonPortsArray,
        inBlocklist: data.inBlocklist !== undefined ? data.inBlocklist : "no info"
    };
};


export default FetchBackendAPI