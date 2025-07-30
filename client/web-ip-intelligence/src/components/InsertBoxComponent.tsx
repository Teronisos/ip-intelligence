import styles from './InsertBoxComponent.module.css';
import React from "react";

type Props = {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
};

const InsertBoxComponent: React.FC<Props> = ({ inputRef }) => {
  return (
    <textarea
      className={styles.insertBox}
      placeholder="Enter IP address or hostname here..."
      ref={inputRef}
    />
  );
};

export default InsertBoxComponent;
