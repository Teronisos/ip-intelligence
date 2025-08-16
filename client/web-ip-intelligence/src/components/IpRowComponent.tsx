import styles from './IpRowComponent.module.css';


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
    commonPorts?: CommonPort[]; // <-- Typ korrekt setzen
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

    const flagSymbol = flag.toLowerCase() === "unknown" || !flag
        ? "?"
        : countryCodeToEmoji(flag);




    return (
        <li className={styles.ipItem}>
            {/* IP + Hostname */}
            <div className={styles.ipLeft}>
                <span className={styles.ipAddress}>{ip}</span>
                <small className={styles.hostname}>{hostname}</small>
            </div>

            {/* Mitte */}
            <div className={styles.ipMid}>
                <span className={styles.flag}>{flagSymbol}</span>
                &nbsp; | <span>{location}</span> | <span>{org}</span>
            </div>

            {/* Status */}
            <div className={styles.ipRight}>
                {/* Abuse */}
                <span className={`${styles.statusTag} ${abuseClass}`}>{abuse}</span>

                {/* Ping */}
                <span className={`${styles.statusTag} ${ping ? styles.pingSuccess : styles.pingDanger}`}>
                    {pingText}
                </span>

                {/* Common Ports */}
                <span>
                    {commonPorts && commonPorts.length > 0
                        ? commonPorts.map((p) => (
                            <span
                                key={p.port}
                                className={`${styles.portOpen} ${!p.open ? styles.portClosed : ""}`}
                            >
                                {p.port} {p.open ? "✓" : "✗"}
                            </span>
                        ))
                        : <span className={styles.statusTag}>—</span>}
                </span>
            </div>

        </li>
    );
};

function countryCodeToEmoji(code: string) {
    return code
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default IpRow;
