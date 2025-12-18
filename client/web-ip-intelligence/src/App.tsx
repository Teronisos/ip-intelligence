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
  ping: string | boolean;
  commonPorts: CommonPort[];
  inBlocklist: boolean;
}

type DnsAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};



const resolveDomain = async (domain: string): Promise<string[]> => {
  try {
    //console.log(domain)
    const res = await fetch(
      `https://dns.google/resolve?name=${domain}&type=A`
    );
    const data = await res.json();

    const answers: DnsAnswer[] = data.Answer || [];

    const ips = answers
      .filter((a) => a.type === 1) // 1 = A-Record (IPv4)
      .map((a) => a.data);

    return ips;
  } catch (e) {
    console.error("DNS lookup failed for:", domain);
    return [];
  }
};

const App = () => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ipInfos, setIpInfos] = useState<IPInfo[]>([]);
  const handleClick = async () => {
    const value = textareaRef.current?.value;
    const extracted = extractIPs(value ?? "");

    setIpInfos([]);

    for (const item of extracted) {
      let ips: string[] = [];


      const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(item);

      if (isIPv4) {

        ips = [item];
      } else {

        ips = await resolveDomain(item);
        //console.log(ips)
        if (ips.length === 0) {
          console.error(`Domain konnte nicht aufgelöst werden: ${item}`);
          continue;
        }
      }


      for (const ip of ips) {
        try {
          //console.log(ip)
          const data = await fetchIPDetails(ip);

          setIpInfos(prev => [...prev, data]);

        } catch (error) {
          console.error("Fehler bei IP:", ip, error);
        }
      }
    }
  };




  const extractIPs = (text: string): string[] => {
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const domainRegex = /\b((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b/g;

    const ips = (text.match(ipRegex) || []).filter(isPublicIPv4);
    const domains = (text.match(domainRegex) || [])
      .filter(d => d.toLowerCase() !== 'localhost');

    return Array.from(new Set([...ips, ...domains]));
  };


  const isPublicIPv4 = (ip: string): boolean => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) {
      return false;
    }

    const [a, b, c, d] = parts;

    return !(
      a === 0 ||                          // 0.0.0.0/8
      a === 10 ||                         // 10.0.0.0/8
      a === 127 ||                        // Loopback
      (a === 169 && b === 254) ||         // Link-local
      (a === 172 && b >= 16 && b <= 31) ||// 172.16.0.0/12
      (a === 192 && b === 168) ||         // 192.168.0.0/16
      (a >= 224 && a <= 239) ||           // Multicast
      (a >= 240) ||                       // Reserved
      (a === 255 && b === 255 && c === 255 && d === 255)
    );
  };


  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchIPDetails = async (ip: string): Promise<IPInfo> => {
    const response = await axios.get(`${apiUrl}/api/ip`, { params: { q: ip } });
    const data = response.data;


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
      inBlocklist: data.inBlocklist !== undefined ? data.inBlocklist : "no info"
    };
  };


  return (
    <>
      <header>
        <span className="version">v2025-12</span>
        <div className="rightHeader">
          <h1><span className="highlight-box">IP Intelligence</span> Dashboard</h1>
        </div>
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
                inBlocklist={info.inBlocklist}
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

