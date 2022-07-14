import styles from "../labeler/HistoryItem.module.scss";
import { LabelHistory } from "./StyleLabelerSlice";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { v4 } from "uuid";
import React from "react";

type PropType = {
    onClick: (e: React.MouseEvent) => void;
    idx: number;
} & LabelHistory;
export const HistoryItem = (prop: PropType) => {
    // 修改标注
    return (
        // 完成卡片交互!
        <div className={styles.item} onClick={prop.onClick}>
            <div className={styles.badge} data-finished={prop.finished}>
                {prop.finished ? "✔" : "✘"}
            </div>
            <div className={styles.item_left}>
                <div className={styles.item_firstline}>
                    <div className={styles.item_firstline_title}>
                        <span>({prop.idx + 1}) {prop.img_title}</span>
                    </div>
                    <div className={styles.item_firstline_id}>
                        {prop.img_id.split("").slice(16, 24).join("")}
                        {/* {prop.img_id} */}
                    </div>
                </div>
                <div className={styles.item_secondline}>
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
                </div>
            </div>
            <div className={styles.item_right}>
                <div className={styles.item_right_cover}>
                    <LazyLoadImage src={prop.img_src} alt="" width="64" height="64" loading="lazy" decoding="async" />
                </div>
            </div>
        </div>
    );
};
