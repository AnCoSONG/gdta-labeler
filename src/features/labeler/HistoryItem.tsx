import styles from "./HistoryItem.module.scss";
import { LabelHistory } from "./LabelSlice";
import { v4 } from "uuid";
import React from "react";

type PropType = {
    onClick: (e: React.MouseEvent) => void;
} & LabelHistory;
export const HistoryItem = (prop: PropType) => {
    // 修改标注
    
    return (
        // 完成卡片交互!
        <div className={styles.item} onClick={prop.onClick}>
            <div className={styles.badge} data-finished={prop.finished}>
                {prop.finished? '✔' : '✘'}
            </div>
            <div className={styles.item_left}>
                <div className={styles.item_firstline}>
                    <div className={styles.item_firstline_title}>
                        <span>{prop.img_title}</span>
                    </div>
                    <div className={styles.item_firstline_id}>
                        {prop.img_id.split("").slice(16, 24).join("")}
                        {/* {prop.img_id} */}
                    </div>
                </div>
                <div className={styles.item_secondline}>
                    <div className={styles.item_secondline_check_wrapper}>
                        <div
                            className={styles.check}
                            data-checked={prop.valid===0}
                        ></div>
                        <div
                            className={styles.check}
                            data-checked={prop.valid===1}
                        ></div>
                        <div
                            className={styles.check}
                            data-checked={prop.valid===2}
                        ></div>
                    </div>
                    <div className={styles.item_secondline_check_wrapper}>
                        {prop.styles.map((item) => {
                            return (
                                <div
                                    className={styles.check}
                                    key={v4()}
                                    data-checked={item}
                                ></div>
                            );
                        })}
                    </div>
                    <div className={styles.item_secondline_check_wrapper}>
                        {prop.audience_gender.map((item) => {
                            return (
                                <div
                                    className={styles.check}
                                    key={v4()}
                                    data-checked={item}
                                ></div>
                            );
                        })}
                    </div>
                    <div className={styles.item_secondline_check_wrapper}>
                        {prop.audience_age.map((item) => {
                            return (
                                <div
                                    className={styles.check}
                                    key={v4()}
                                    data-checked={item}
                                ></div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className={styles.item_right}>
                <div className={styles.item_right_cover}>
                    <img src={prop.img_src} alt="" width="64" height="64" />
                </div>
            </div>
        </div>
    );
};
