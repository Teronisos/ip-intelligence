import React, { useRef, useState } from "react";
import InsertBoxComponent from "./components/InsertBoxComponent";
import IpRow from "./components/IpRowComponent";
import ExtractIPsButton from "./components/ExtractIPsButton";
import axios from "axios";

interface IPInfo {
  ip: string;
  hostname: string;
  flag: string;
  location: string;
  asn: string;
  org: string;
  abuse: string;
  ping: string;
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
        setIpInfos((prev) => [...prev, data]);
      } catch (error) {
        console.error("Fehler bei IP:", ip);
      }
    });
  };

  const extractIPs = (text: string): string[] => {
    const ipRegex = /(?:\d{1,3}\.){3}\d{1,3}/g;
    const matches = text.match(ipRegex) || [];
    return Array.from(new Set(matches)); // Duplikate entfernen
  };

  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchIPDetails = async (ip: string): Promise<IPInfo> => {
    const response = await axios.get(`${apiUrl}/api/ip`, {
      params: { q: ip },
    });

    const data = response.data;

    return {
      ip: data.ip,
      hostname: data.domain || "unknown",
      flag: data.countryCode || "unknown",
      location: `${data.countryCode || ""}`,
      asn: "N/A",
      org: data.ips || "unknown",
      abuse: `Abuse: ${data.abuse ?? 0}%`,
      ping: data.pingStatus
        ? "ping"
        : data.tcpPingStatus
          ? "online (TCP 80)"
          : "unknown",
    };
  };



  return (
    <>
      <header>
        <h1>
          <span className="highlight-box">IP Intelligence</span> Dashboard
        </h1>
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
                asn={info.asn}
                org={info.org}
                abuse={info.abuse}
                ping={info.ping}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default App;
