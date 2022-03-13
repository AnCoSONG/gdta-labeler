import styles from './Menu.module.css'
import React from 'react'
type propType = {
    on: Boolean
    setOn: React.Dispatch<React.SetStateAction<boolean>>
}
export const Menu = (props: propType) => {
    return <div
    className={styles.menu}
    onClick={() => props.setOn(!props.on)}
    data-on={props.on}
>
    <div className={`${styles.line1} ${styles.line}`}></div>
    <div className={`${styles.line2} ${styles.line}`}></div>
    <div className={`${styles.line3} ${styles.line}`}></div>
</div>
}