import axios from "axios";
import EvaluatedIpData from "../structs/EvaluatedIpData";

const FetchRIPE = async (ip: string): Promise<EvaluatedIpData> => {
    try {
        const res = await fetch(`https://rdap.db.ripe.net/ip/${encodeURIComponent(ip)}`);
        if (!res.ok) throw new Error(`RDAP error: ${res.status}`);
        const data = await res.json();

        // Abuse-E-Mail aus entities suchen (role: 'abuse')
        const abuseEntity = data.entities?.find((e: any) => e.roles?.includes("abuse"));
        const abuseEmail = abuseEntity?.vcardArray?.[1]?.find((v: any) => v[0] === "email")?.[3];
        console.log("RIPE data:", data);
        const evaluatedData: EvaluatedIpData = {
            ip,
            abuse: abuseEmail || "",               // Abuse-Mail, falls vorhanden
            abuseMail: abuseEmail || undefined,   // Optional
            ping: false,                           // nicht verfügbar, default false
            commonPorts: [],                       // nicht verfügbar, default leer
            inBlocklist: false,                    // nicht verfügbar, default false
            hostname: undefined,                   // nicht verfügbar
            location: data.country || "",          // country aus RDAP
            org: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || undefined,
            company: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || undefined,
            asn: undefined,                        // ASN nicht direkt aus diesem Endpoint
            nat: false                             // nicht verfügbar, default false
        };
        console.log(evaluatedData.location)

        return evaluatedData;
    } catch (error) {
        console.error("Error fetching IP data from RIPE:", error);
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

export default FetchRIPE;
