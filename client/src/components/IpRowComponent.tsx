import React, { useState } from 'react';
import styles from './IpRowComponent.module.css';
import Flag from 'react-world-flags';
import Modal from './Modal';
import EvaluatedIpData from '../structs/EvaluatedIpData';


const IpRow: React.FC<EvaluatedIpData> = ({
    ip,
    hostname,
    country: location,
    org,
    company,
    asn,
    abuse,
    abuseMail,
    ping,
    commonPorts,
    inBlocklist,
    nat
}) => {
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

    const flagSymbol = location?.toLowerCase() || "n/a";

    const [showModalIp, setShowModalIp] = useState<string | null>(null);

    const openModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModalIp(ip);
    };



    return (
    <li className={styles.ipItem}>
        <div className={styles.ipLeft}>
            <span className={styles.ipAddress}>{ip}</span>
            <small className={styles.hostname}>{hostname}</small>
        </div>

        <div className={styles.ipMid}>
            <div className={styles.flag}>
                <Flag code={flagSymbol} />
            </div>
            <span className={styles.trenner}>•</span>
            <span>{location}</span>
            <span className={styles.trenner}>•</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {org}
            </span>
        </div>

        <div className={styles.ipRight}>
            <span className={`${styles.statusTag} ${abuseClass}`}>
                {abuse !== "n/a" ? (abuse.includes('%') ? abuse : `${abuse}%`) : "n/a"}
            </span>

            <span className={`${styles.statusTag} ${ping ? styles.pingSuccess : styles.pingDanger}`}>
                PING
            </span>

            <div className={styles.blocklistWrapper}>
                {inBlocklist === true ? (
                    <a
                        href={`https://lists.blocklist.de/lists/all.txt#:~:text=${ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={`${styles.statusTag} ${styles.blocked}`}>in blocklist</span>
                    </a>
                ) : inBlocklist === false ? (
                    <span className={`${styles.statusTag} ${styles.clean}`}>clean</span>
                ) : (
                    <span className={`${styles.statusTag} ${styles.noInfo}`}>
                        {inBlocklist === "n/a" ? "n/a" : "❔ No Info"}
                    </span>
                )}
            </div>

            <div className={styles.portGroup}>
                {commonPorts && commonPorts.length > 0 && commonPorts[0].port !== "n/a" ? (
                    commonPorts.map((p) => (
                        <span
                            key={p.port}
                            className={`${styles.portOpen} ${!p.open ? styles.portClosed : ""}`}
                        >
                            {p.port}
                        </span>
                    ))
                ) : (
                    <span style={{ color: '#44475a' }}>—</span>
                )}
            </div>

            <div
                className={styles.addButton}
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${ip}`}
                onClick={openModal}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openModal(e)}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </div>
        </div>


        {showModalIp && (
            <Modal
                ip={showModalIp}
                commonPorts={commonPorts}
                inBlocklist={inBlocklist}
                ping={ping}
                abuse={abuse}
                hostname={hostname}
                org={org}
                country={location}
                abuseMail={abuseMail}
                asn={asn}
                onClose={() => setShowModalIp(null)}
            />
        )}
    </li>
);};


export default IpRow;
