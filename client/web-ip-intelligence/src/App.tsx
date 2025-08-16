import InsertBoxComponent from "./components/InsertBoxComponent";
import IpRow from "./components/IpRowComponent";
import ExtractIPsButton from "./components/ExtractIPsButton";
import React, { useRef, useState } from "react";
import axios from "axios";

type CommonPort = {
  port: number;
  open: boolean;
};

interface IPInfo {
  ip: string;
  hostname: string;
  flag: string;
  location: string;
  org: string;
  abuse: string;
  ping: boolean;
  commonPorts: CommonPort[];
}




const App = () => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ipInfos, setIpInfos] = useState<IPInfo[]>([]);
  const handleClick = async () => {
    const value = textareaRef.current?.value;
    const extracted = extractIPs(value ?? "");

    setIpInfos([]); // clear

    extracted.forEach(async (ip) => {
      try {
        const data = await fetchIPDetails(ip);

        // Append result directly
        setIpInfos(prev => [...prev, data]);

      } catch (error) {
        console.error("Fehler bei IP:", ip);
      }
    });
  };



  const extractIPs = (text: string): string[] => {
    const ipRegex = /(?:\d{1,3}\.){3}\d{1,3}/g;
    const matches = text.match(ipRegex) || [];


    const uniqueIPs = Array.from(new Set(matches));

    return uniqueIPs;
  };

  const apiUrl = process.env.REACT_APP_API_URL;
  console.log(apiUrl)
  const fetchIPDetails = async (ip: string): Promise<IPInfo> => {
  const response = await axios.get(`${apiUrl}/api/ip`, { params: { q: ip } });
  const data = response.data;

  // commonPorts in Array umwandeln
  const commonPortsArray: CommonPort[] = data.commonPorts
    ? Object.entries(data.commonPorts).map(([port, isOpen]) => ({
        port: parseInt(port.replace("port", ""), 10),
        open: Boolean(isOpen),
      }))
    : [];

  return {
    ip: data.ip,
    hostname: data.domain || "unknown",
    flag: data.countryCode || "unknown",
    location: `${data.countryCode || ""}`,
    org: data.isp || "unknown",
    abuse: `Abuse: ${data.abuse ?? 0}%`,
    ping: data.pingStatus || false,
    commonPorts: commonPortsArray,
  };
};


  return (
    <>
      <header>
        <h1><span className="highlight-box">IP Intelligence</span> Dashboard</h1>
      </header>

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
                flag={info.flag}
                location={info.location}
                org={info.org}
                abuse={info.abuse}
                ping={info.ping}
                commonPorts={info.commonPorts}
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

