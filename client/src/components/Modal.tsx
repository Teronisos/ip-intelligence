import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import EvaluatedIpData from '../structs/EvaluatedIpData';
import Flag from 'react-world-flags';

interface ModalProps extends EvaluatedIpData {
    onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({
    onClose, ip, hostname, org, company, country, commonPorts, inBlocklist, ping, abuse, abuseMail, asn,
}) => {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handleKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const abusePct = abuse ? (parseInt(abuse.match(/(\d+)/)?.[0] || "0")) : null;

    const modalNode = (
        <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} ref={modalRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
                
                <header className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <span className={styles.label}>IP ADDRESS</span>
                        <h2>{ip}</h2>
                        <span className={styles.subtext}>{hostname || 'No Hostname'}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </header>

                <div className={styles.bodyContainer}>
                    {/* INFO SECTION */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>General Information</h3>
                        <div className={styles.grid}>
                            <div className={styles.infoRow}><span className={styles.key}>Organization:</span> <span className={styles.value}>{org || company || '—'}</span></div>
                            <div className={styles.infoRow}><span className={styles.key}>ASN:</span> <span className={styles.value}>{asn ? `AS${asn}` : '—'}</span></div>
                            <div className={styles.infoRow}>
                                <span className={styles.key}>Location:</span> 
                                <span className={styles.value}><Flag code={country} className={styles.flagIcon} /> {country || '—'}</span>
                            </div>
                            <div className={styles.infoRow}><span className={styles.key}>Abuse Contact:</span> <span className={styles.value}>{abuseMail ? <a href={`mailto:${abuseMail}`}>{abuseMail}</a> : '—'}</span></div>
                        </div>
                    </div>

                    {/* STATUS SECTION */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Security & Connectivity</h3>
                        <div className={styles.grid}>
                            <div className={styles.infoRow}>
                                <span className={styles.key}>Status:</span> 
                                <span className={`${styles.badge} ${ping ? styles.success : styles.error}`}>
                                    {ping ? 'ALIVE' : 'NO RESPONSE'}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.key}>Blocklist:</span> 
                                <span className={`${styles.badge} ${inBlocklist ? styles.error : styles.success}`}>
                                    {inBlocklist ? 'LISTED' : 'CLEAN'}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.key}>Abuse Score:</span> 
                                <span className={`${styles.scoreBadge} ${abusePct && abusePct > 50 ? styles.scoreHigh : (abusePct && abusePct > 15 ? styles.scoreMed : styles.scoreLow)}`}>
                                    {abusePct !== null ? `${abusePct}%` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* PORTS SECTION */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Service Analysis (Common Ports)</h3>
                        <div className={styles.portContainer}>
                            {commonPorts && commonPorts.length > 0 ? (
                                commonPorts.map((p) => (
                                    <div key={p.port} className={`${styles.portItem} ${p.open ? styles.portOpen : styles.portClosed}`}>
                                        <span className={styles.portNumber}>{p.port}</span>
                                        <span className={styles.portStatus}>{p.open ? 'OPEN' : 'CLOSED'}</span>
                                    </div>
                                ))
                            ) : 'No scan data available'}
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};

export default Modal;