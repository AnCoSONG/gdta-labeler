// import styles from './index.module.scss';
import commonStyles from '../Common.module.scss';
import { useState } from 'react';
export const Question1 = () => {
    const [selected, setSelected] = useState(true);
    return (
        <div className={commonStyles.question_card}>
            <div className={commonStyles.question_card_title}>
                1. 这幅作品是否有效？
            </div>
            <div
                className={commonStyles.line_btn}
                onClick={() => setSelected(true)}
                data-selected={selected}
            >
                是
            </div>
            <div
                className={commonStyles.line_btn}
                onClick={() => setSelected(false)}
                data-selected={!selected}
                data-last={true}
            >
                否
            </div>
        </div>
    );
};
