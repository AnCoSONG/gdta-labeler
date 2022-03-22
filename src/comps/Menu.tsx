import styles from "./Menu.module.css";
import React from "react";
type propType = {
    on: Boolean;
    onClick: (e: React.MouseEvent) => void;
};
export const Menu = (props: propType) => {
    return (
        <div
            className={styles.menu}
            onClick={props.onClick}
            data-on={props.on}
        >
            <div className={`${styles.line1} ${styles.line}`}></div>
            <div className={`${styles.line2} ${styles.line}`}></div>
            <div className={`${styles.line3} ${styles.line}`}></div>
        </div>
    );
};
