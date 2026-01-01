import React, { useState } from 'react';
import styles from './IpRowComponent.module.css';
import Flag from 'react-world-flags';
import Modal from './Modal';

export type CommonPort = {
    port: number;
    open: boolean;
};

interface IpRowProps {
    ip: string;
    hostname: string;
    flag: string;
    location: string;
    org: string;
    abuse: string;
    ping: string | boolean;
    abuseColor?: string;
    pingColor?: string;
    commonPorts?: CommonPort[];
    inBlocklist: boolean;
}


const IpRow: React.FC<IpRowProps> = ({
    ip,
    hostname,
    flag,
    location,
    org,
    abuse,
    ping,
    commonPorts = [],
    inBlocklist
}) => {
    const pingClass = ping === "true" || ping === true ? styles.pingSuccess : styles.pingDanger;
    const pingText = "ping"

    const abuseValue = parseInt(abuse.match(/\d+/)?.[0] || "0", 10);
    let abuseClass = styles.abuseSuccess;

    switch (true) {
        case abuseValue >= 60:
            abuseClass = styles.abuseDanger;
            break;
        case abuseValue >= 20:
            abuseClass = styles.abuseWarning;
            break;
        default:
            abuseClass = styles.abuseSuccess;
    }

    const flagSymbol = flag.toLowerCase()

    const [showModalIp, setShowModalIp] = useState<string | null>(null);

    const openModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModalIp(ip);
    };



    return (

        <li className={styles.ipItem}>
            {/* IP + Hostname */}
            <div className={styles.ipLeft}>
                <span className={styles.ipAddress}>{ip}</span>
                <small className={styles.hostname}>{hostname}</small>
            </div>

            {/* Middle */}
            <div className={styles.ipMid}>
                <span className={styles.flag}>
                    <Flag code={flagSymbol} />
                </span>
                <span className={styles.trenner}>•</span>
                <span>{location}</span>
                <span className={styles.trenner}>•</span>
                <span>{org}</span>
            </div>


            {/* Status */}
            <div className={styles.ipRight}>
                <span className={`${styles.statusTag} ${abuseClass}`}>{abuse}</span>

                <span className={`${styles.statusTag} ${ping ? styles.pingSuccess : styles.pingDanger}`}>
                    {pingText}
                </span>
                {inBlocklist === true && (
                    <a
                        href={`https://lists.blocklist.de/lists/all.txt#:~:text=${ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={`${styles.statusTag} ${styles.blocked}`}>in blocklist</span>
                    </a>
                )}
                {inBlocklist === false && (
                    <span className={`${styles.statusTag} ${styles.clean}`}>clean</span>
                )}
                {inBlocklist !== true && inBlocklist !== false && (
                    <span className={`${styles.statusTag} ${styles.noInfo}`}>❔ No Info</span>
                )}

                <span className={styles.statusTag}>
                    {commonPorts && commonPorts.length > 0
                        ? commonPorts.map((p) => (
                            <span
                                key={p.port}
                                className={`${styles.portOpen} ${!p.open ? styles.portClosed : ""}`}
                            >
                                {p.port}
                            </span>
                        ))
                        : "—"}
                </span>
                <span
                    className={styles.addButton}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${ip}`}
                    onClick={openModal}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openModal(e)}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </span>

                {showModalIp && (
                    <Modal
                        ip={showModalIp}
                        onClose={() => setShowModalIp(null)}
                        commonPorts={commonPorts}
                        inBlocklist={inBlocklist}
                        ping={ping}
                        abuse={abuse}
                        hostname={hostname}
                        org={org}
                        flag={flag}
                        location={location}
                    />
                )}


            </div>

        </li>
    );
};


export default IpRow;
