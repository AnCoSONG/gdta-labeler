// import styles from "./Question3.module.scss";
import commonStyles from "../Common.module.scss";

export const Question3 = () => {
    return (
        <div className={commonStyles.question_card}>
            <div className={commonStyles.question_card_title}>
                3. 这幅作品的受众包括哪些性别?(多选)
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                    <li className={commonStyles.tag}>男性</li>
                    <li className={commonStyles.tag}>女性</li>
                </ul>
            </div>
        </div>
    );
};
