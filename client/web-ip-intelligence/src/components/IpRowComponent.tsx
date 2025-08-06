import styles from './IpRowComponent.module.css';

const IpRow = ({
    ip = "",
    hostname = "",
    flag = "",
    location = "",
    asn = "",
    org = "",
    abuse = "",
    abuseColor = "", // eigener Modul-Klassenname
    ping = "",
    pingColor = ""
}) => {
    const pingValue = ping.toLowerCase();
    let pingClass = styles.pingSuccess;
    if (pingValue.includes("unknown")) {
        pingClass = styles.pingDanger;
    }
    if (pingValue.includes("tcp")) {
        pingClass = styles.pingTcp;
    }

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
                &nbsp; | <span>{location}</span> | <span>{org}</span> | <span>{asn}</span>
            </div>

            {/* Status */}
            <div className={styles.ipRight}>
                <span className={`${styles.statusTag} ${abuseClass}`}>{abuse}</span>
                <span className={`${styles.statusTag} ${pingClass}`}>{ping}</span>
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
