import axios from "axios";
import EvaluatedIpData from "../structs/EvaluatedIpData";


function extractAbuseEmail(data: any): string | undefined {
    try {
        const entities = data?.entities || [];


        const abuseRoles = ["abuse", "noc", "security", "postmaster", "tech"];


        const abuseEntity = entities.find(
            (en: any) =>
                Array.isArray(en.roles) &&
                en.roles.some((r: string) => abuseRoles.some(role => new RegExp(role, "i").test(r)))
        );

        const candidates = abuseEntity ? [abuseEntity, ...entities] : entities;

        for (const en of candidates) {
            const vcardEntries = en?.vcardArray?.[1] || [];
            for (const entry of vcardEntries) {
                if (entry?.[0] === 'email') return entry?.[3] ?? undefined;
            }
        }


        const text = JSON.stringify(data);
        const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        return match ? match[0] : undefined;
    } catch {
        return undefined;
    }
}



const FetchRIPE = async (ip: string): Promise<EvaluatedIpData> => {
    try {
        const res = await axios.get(`https://rdap.db.ripe.net/ip/${encodeURIComponent(ip)}`);

        const data = res.data;
        const abuseEmail = extractAbuseEmail(data);


        const evaluatedData: EvaluatedIpData = {
            ip,
            abuse: "",
            abuseMail: abuseEmail || undefined,
            ping: false,
            commonPorts: [],
            inBlocklist: false,
            hostname: undefined,
            country: data.country || "",
            org: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || undefined,
            company: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || undefined,
            asn: undefined,
            nat: false
        };

        return evaluatedData;
    } catch (error: any) {
        const status = error.response?.status;
        console.error(`Error fetching IP data from RIPE (${status || 'Network Error'}):`, error.message);

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

export default FetchRIPE;
