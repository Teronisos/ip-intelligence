import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import Flag from 'react-world-flags';
import type {
    ICountry,
    ICountryData,
    ILanguage,
    TContinentCode,
    TCountryCode,
    TLanguageCode,
} from 'countries-list'
import { getCountryData } from 'countries-list'


interface ModalProps {
    ip?: string | null;
    onClose?: () => void;
    commonPorts?: { port: number; open: boolean }[];
    inBlocklist?: boolean | string;
    ping?: string | boolean;
    abuse?: string;
    hostname?: string;
    org?: string;
    flag?: string;
    location?: string;
}

const fetchRIPE = async (ip: string): Promise<any> => {
    try {
        const res = await fetch(`https://rdap.db.ripe.net/ip/${encodeURIComponent(ip)}`);
        if (!res.ok) throw new Error(`RDAP error: ${res.status}`);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("RIPE fetch error", e);
        throw e;
    }
};


const Modal: React.FC<ModalProps> = ({ ip, onClose, commonPorts = [], inBlocklist, ping, abuse, hostname, org, flag, location }) => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [data, setData] = React.useState<any | null>(null);
    const [asn, setAsn] = React.useState<number | null>(null);
    const [asnOrg, setAsnOrg] = React.useState<string | null>(null);
    const [countryCode, setCountryCode] = React.useState<string | null>(null);
    const [orgAddress, setOrgAddress] = React.useState<string | null>(null);
    // compute quick derived status

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKey);
        modalRef.current?.focus();


        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    useEffect(() => {
        let mounted = true;
        if (!ip) {
            setData(null);
            setError(null);
            setLoading(false);
            setAsn(null);
            setAsnOrg(null);
            return;
        }

        setLoading(true);
        setError(null);
        fetchRIPE(ip)
            .then((d) => {
                if (!mounted) return;
                setData(d);
                // try to grab country from RDAP response
                const cc = (d?.country || d?.countryCode || null);
                if (cc) setCountryCode(String(cc).toUpperCase());
            })
            .catch((e) => {
                if (!mounted) return;
                setError(String(e.message || e));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        // fetch ASN from OXL GeoIP API in parallel
        const fetchOxlAsn = async (ipAddr: string) => {
            try {
                const res = await fetch(
                    `https://geoip.oxl.app/api/ip/${encodeURIComponent(ipAddr)}`
                );

                if (!res.ok) {
                    throw new Error(`OXL error ${res.status}`);
                }

                const data = await res.json();
                if (!mounted) return;

                // ASN
                setAsn(data?.asn ? Number(data.asn) : null);

                // Organisation
                const org = data?.organization;
                setAsnOrg(org?.name ?? null);

                // Organisationsadresse
                if (org) {
                    const addressParts = [
                        org.address1,
                        org.address2,
                        org.suite,
                        org.floor,
                        org.city,
                        org.state,
                        org.zipcode,
                        org.country,
                    ].filter(Boolean);

                    setOrgAddress(
                        addressParts.length ? addressParts.join(", ") : null
                    );
                } else {
                    setOrgAddress(null);
                }

            } catch (error) {
                // OXL-Fehler still ignorieren
                if (!mounted) return;

                setAsn(null);
                setAsnOrg(null);
                setOrgAddress(null);
            }
        };


        fetchOxlAsn(ip).catch(() => { });

        return () => { mounted = false; };
    }, [ip]);


    const extractAbuseEmail = (d: any): string | null => {
        try {
            const entities = d?.entities || [];

            const abuseEntity = entities.find((en: any) => Array.isArray(en.roles) && en.roles.some((r: string) => /abuse/i.test(r)));
            const candidates = abuseEntity ? [abuseEntity, ...entities] : entities;

            for (const en of candidates) {
                const v = en?.vcardArray?.[1] || [];
                for (const entry of v) {
                    if (entry?.[0] === 'email') return entry?.[3] ?? null;
                }
            }


            const text = JSON.stringify(d || {});
            const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
            return m ? m[0] : null;
        } catch (e) {
            return null;
        }
    };


    const ipToInt = (ip: string) => ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
    const intToIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    const isPowerOfTwo = (n: number) => (n & (n - 1)) === 0;

    const extractSubnet = (d: any): string | null => {
        // prefer explicit v4prefix + length
        if (d?.v4prefix && (d.length || d.prefix_length || d.maxLength || d.minLength)) {
            const len = d.length ?? d.prefix_length ?? d.maxLength ?? d.minLength;
            return `${d.v4prefix}/${len}`;
        }

        // common CIDR representations
        if (d?.cidr && Array.isArray(d.cidr) && d.cidr.length) return d.cidr[0];
        if (typeof d?.cidr === 'string') return d.cidr;

        // try RDAP fields
        const start = d?.startAddress || d?.start_address || d?.start;
        const end = d?.endAddress || d?.end_address || d?.end;
        if (start && end) {
            // try to reduce to single CIDR if range is exact power-of-two block and aligned
            try {
                const s = ipToInt(start);
                const e = ipToInt(end);
                const size = e - s + 1;
                if (size > 0 && isPowerOfTwo(size) && (s % size) === 0) {
                    const mask = 32 - Math.round(Math.log2(size));
                    return `${start}/${mask}`;
                }
            } catch (err) {
                // fallback to range
            }
            return `${start} — ${end}`;
        }

        // fallback: any prefix fields
        if (d?.start && d?.prefix) return `${d.start}/${d.prefix}`;

        return null;
    };

    // registered location removed per request

    const port80Open = Array.isArray(commonPorts) && commonPorts.some((p) => Number(p.port) === 80 && p.open === true);

    const formatHostForUrl = (host?: string | null) => {
        if (!host) return '';
        return host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
    };
    const httpHref = ip ? `http://${formatHostForUrl(ip)}` : undefined;

    const effectiveFlag = flag ?? countryCode ?? undefined;

    const parseAbusePct = (s?: string | null): number | null => {
        const text = s ?? data?.abuse ?? null;
        if (!text) return null;
        const m = String(text).match(/(\d{1,3})/);
        if (!m) return null;
        const n = Number(m[1]);
        if (Number.isNaN(n)) return null;
        return Math.max(0, Math.min(100, n));
    };

    const abusePct = parseAbusePct(abuse);



    const modalNode = (
        <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Modal">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
            >
                <div className={styles.content}>
                    <header className={styles.header}>
                        <div className={styles.headerLeft}>
                            <h2 className={styles.title}>{ip}</h2>
                            <div className={styles.subtitle}>{hostname ?? '—'}</div>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.smallAction} aria-label="ASN placeholder">{asn ? `AS${asn}` : 'ASN'}</button>
                            <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
                        </div>
                    </header>

                    {ip ? (
                        loading ? (
                            <div>Loading data for <strong>{ip}</strong>…</div>
                        ) : error ? (
                            <div>Error loading: {error}</div>
                        ) : data ? (
                            <div style={{ width: '100%' }} className={styles.bodyGrid}>
                                <section className={styles.mainCol}>
                                    <div className={styles.fields}>
                                        <div className={styles.field}>
                                            <div className={styles.label}>Subnet</div>
                                            <div className={`${styles.value} ${styles.mono}`}>{extractSubnet(data) ?? '—'}</div>
                                        </div>

                                        <div className={styles.field}>
                                            <div className={styles.label}>ASN</div>
                                            <div className={styles.value}>{asn ? `AS${asn}` : '—'}</div>
                                        </div>

                                        <div className={styles.field}>
                                            <div className={styles.label}>Company</div>
                                            <div className={styles.value}>{asnOrg ?? org ?? '—'}</div>
                                        </div>

                                        <div className={styles.field}>
                                            <div className={styles.label}>Location</div>
                                            <div className={styles.value}>
                                                {effectiveFlag && (
                                                    <span className={styles.locationFlag}>
                                                        <Flag code={String(effectiveFlag).slice(0, 2).toUpperCase() as TCountryCode} />
                                                    </span>
                                                )}

                                                {getCountryData(location ?? data?.country ?? '')?.name ?? '—'}
                                            </div>
                                        </div>


                                        <div className={styles.field}>
                                            <div className={styles.label}>Company Address</div>
                                            <div className={styles.value}>  {orgAddress || <i>unknown</i>}</div>
                                        </div>
                                        <div className={styles.field}>
                                            <div className={styles.label}>Abuse Email</div>
                                            <div className={styles.value}>{extractAbuseEmail(data) ? (
                                                <a href={`mailto:${extractAbuseEmail(data)}`}>{extractAbuseEmail(data)}</a>
                                            ) : '—'}</div>
                                        </div>
                                    </div>

                                </section>

                                <aside className={styles.aside}>
                                    <div className={styles.statusGroup}>
                                        <div className={styles.statusRow}><span className={styles.statusLabel}>Ping</span><span className={`${styles.badge} ${ping === 'true' || ping === true ? styles.up : styles.down}`}>{ping === 'true' || ping === true ? 'alive' : 'no response'}</span></div>
                                        <div className={styles.statusRow}><span className={styles.statusLabel}>Ports</span><span className={styles.portList}>{commonPorts && commonPorts.length > 0 ? commonPorts.map(p => (
                                            <span key={p.port} className={`${styles.portBadge} ${p.open ? styles.portOpen : styles.portClosed}`}>{p.port}</span>
                                        )) : '—'}</span></div>

                                        {port80Open && httpHref && (
                                            <div className={styles.statusRow}><span className={styles.statusLabel}>Weblink</span>
                                                <div className={styles.openLinkRow}><a className={styles.openLink} href={httpHref} target="_blank" rel="noopener noreferrer">{httpHref}</a></div>
                                            </div>
                                        )}
                                        <div className={styles.divider} />

                                        <div className={styles.statusRow}><span className={styles.statusLabel}>Blocklist</span><span className={`${styles.badge} ${inBlocklist === true ? styles.bad : styles.good}`}>{inBlocklist === true ? 'in blocklist' : inBlocklist === false ? 'clean' : 'no info'}</span></div>

                                        <div className={styles.statusRow}>
                                            <span className={styles.statusLabel}>Abusescore</span>

                                            <div className={styles.value}>
                                                {abusePct !== null ? (
                                                    <a
                                                        href={`https://www.abuseipdb.com/check/${ip}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.abuseLink}
                                                    >
                                                        <span
                                                            className={`${styles.badge} ${abusePct >= 60
                                                                ? styles.bad
                                                                : abusePct >= 20
                                                                    ? styles.warn
                                                                    : styles.good
                                                                }`}
                                                        >
                                                            {abusePct}%
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className={styles.badge}>no info</span>
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                </aside>
                            </div>
                        ) : (
                            <div>No data available</div>
                        )
                    ) : (
                        <div>No IP selected</div>
                    )}
                    <div className={styles.modalFooter}>Company data based on geoip.oxl and db.ripe.net</div>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalNode, document.body);
    }

    return null;
};

export default Modal;