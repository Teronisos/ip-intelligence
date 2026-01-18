import styles from './ExtractIPsButton.module.css';
import { useEffect } from 'react';



type Props = {
  onClick: () => void;
};

const ExtractIPsButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.extractButton}>
      Extract Data
    </button>
  );
};



export default ExtractIPsButton;
