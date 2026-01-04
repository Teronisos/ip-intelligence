import InsertBoxComponent from "./components/InsertBoxComponent";
import IpRow from "./components/IpRowComponent";
import ExtractIPsButton from "./components/ExtractIPsButton";
import { useRef, useState } from "react";
import FetchBackendAPI from "./services/FetchBackendAPI";
import FetchOXL from "./services/FetchOXL";
import FetchRIPE from "./services/FetchRIPE";
import ResolveDomain from "./services/ResolveDomain";
import ValidateIP from "./services/ValidateIP";
import EvaluatedIpData from "./structs/EvaluatedIpData";


const App = () => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ipInfos, setIpInfos] = useState<EvaluatedIpData[]>([]);
  const [backendError, setBackendError] = useState(false);

  const getIPInformations = async (ip: string): Promise<EvaluatedIpData> => {
    let backendData: Partial<EvaluatedIpData> = {}; // Default leeres Objekt
    setBackendError(false);
    try {
      backendData = await FetchBackendAPI(ip);
    } catch (error) {
      console.error("Error fetching from backend API:", error);
      setBackendError(true);

    }
    const commonPorts = backendData.commonPorts?.length
      ? backendData.commonPorts
      : [{ port: "n/a", open: false }];

    const [oxlData, ripeData] = await Promise.all([FetchOXL(ip), FetchRIPE(ip)]);

    return {
      ip: backendData.ip || oxlData.ip,
      abuse: backendData.abuse || "n/a",
      abuseMail: backendData.abuseMail || oxlData.abuseMail,
      ping: backendData.ping || "n/a",
      commonPorts,
      inBlocklist: backendData.inBlocklist ?? "n/a",
      hostname: backendData.hostname || oxlData.hostname,
      location: ripeData.location || oxlData.location,
      org: backendData.org || oxlData.org,
      company: backendData.company || oxlData.company,
      asn: oxlData.asn ?? "n/a",
      nat: backendData.nat ?? oxlData.nat,
    };
  };


  const handleClick = async () => {
    const value = textareaRef.current?.value ?? "";
    const ips = await extractIPs(value);

    setIpInfos([]);

    for (const ip of ips) {
      try {
        const data = await getIPInformations(ip);
        setIpInfos(prev => [...prev, data]);
      } catch (err) {
        console.error(`Fehler bei IP ${ip}:`, err);
      }
    }
  };




  const extractIPs = async (text: string): Promise<string[]> => {
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ipv6Regex = /\b(?:[a-fA-F0-9]{1,4}:){2,7}[a-fA-F0-9]{0,4}\b/g;
    const domainRegex = /\b((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b/g;

    const ipv4s = (text.match(ipv4Regex) || []).filter(ip => {
      const result = ValidateIP(ip);
      return result.valid && result.version === "ipv4";
    });

    const ipv6s = (text.match(ipv6Regex) || []).filter(ip => {
      const result = ValidateIP(ip);
      return result.valid && result.version === "ipv6";
    });

    const domains = (text.match(domainRegex) || []).filter(
      d => d.toLowerCase() !== "localhost"
    );

    const resolvedIPs: string[] = [];

    for (const domain of domains) {
      try {
        const ips = await ResolveDomain(domain);
        if (ips.length > 0) {
          resolvedIPs.push(...ips);
        } else {
          console.warn(`Domain konnte nicht aufgelöst werden: ${domain}`);
        }
      } catch (err) {
        console.error(`Fehler bei Domain ${domain}:`, err);
      }
    }

    return Array.from(new Set([...ipv4s, ...ipv6s, ...resolvedIPs]));
  };



  return (
    <>
      <header>
        <span className="version">v2025-12</span>
        <div className="rightHeader">
          <h1>
            <span className="highlight-box">IP Intelligence</span> Dashboard
          </h1>
        </div>
      </header>

      {/* Backend Error Banner über dem Dashboard */}
      {backendError && (
        <div className="backend-error-banner">
          <strong>⚠️ Backend could not be reached!</strong>
          <p>
            Some data as abuse score, ping and port check might be missing as the backend API could not be reached.
          </p>
        </div>
      )}

      <div className="dashboard">
        <div className="input-card">
          <InsertBoxComponent inputRef={textareaRef} />
          <ExtractIPsButton onClick={handleClick} />
        </div>

        <div className="output-card">
          <ul className="ip-list">
            {ipInfos.map((info, index) => (
              <IpRow
                key={index}
                ip={info.ip}
                hostname={info.hostname}
                location={info.location}
                org={info.org}
                company={info.company}
                asn={info.asn}
                abuse={info.abuse}
                abuseMail={info.abuseMail}
                ping={info.ping}
                commonPorts={info.commonPorts}
                inBlocklist={info.inBlocklist}
                nat={info.nat}
              />
            ))}
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>
          🚀 Get Code on&nbsp;
          <a href="https://github.com/Teronisos/ip-intelligence" target="_blank">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
};
export default App;

