import styles from "./HistoryItem.module.scss";
type propType = {
    title: string;
    id: string,
    imgsrc: string
}
export const HistoryItem = (prop: propType) => {

    return (
        <div className={styles.item}>
            <div className={styles.item_left}>
                <div className={styles.item_left_title}>
                    {prop.title}
                </div>
                <div className={styles.item_left_id}>
                    ID {prop.id}
                </div>
            </div>
            <div className={styles.item_right}>
                <img
                    src={prop.imgsrc}
                    alt=""
                    width={64}
                    height={64}
                />
            </div>
        </div>
    );
};
