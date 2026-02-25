import styles from './ExtractIPsButton.module.css';

type Props = {
  onClick: () => void;
  loading: boolean; // 1. Hier das Prop im Type definieren
};

const ExtractIPsButton: React.FC<Props> = ({ onClick, loading }) => { // 2. Hier entpacken
  return (
    <button 
      onClick={onClick} 
      className={styles.extractButton}
      disabled={loading} // 3. Button deaktivieren, während er lädt
    >
      {loading ? (
        <span className={styles.loaderContainer}>
          <span className={styles.spinner}></span>
          Scanning...
        </span>
      ) : (
        "Extract Data"
      )}
    </button>
  );
};

export default ExtractIPsButton;