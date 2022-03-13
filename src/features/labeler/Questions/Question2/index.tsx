import commonStyles from "../Common.module.scss";
import { useState } from "react";
import { Popover } from "element-react";

export const Question2 = () => {
    const [selected, setSelected] = useState([false, false, false, false, false, false, false]);
    const processSelected = (idx: number) => {
        const temp = [...selected];
        temp[idx] = !temp[idx];
        setSelected(temp);
    }
    return (
        <div className={commonStyles.question_card}>
            <div className={commonStyles.question_card_title}>
                2. 这幅作品属于哪些风格?(多选)
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                <Popover placement="top-start" title="现代风格的介绍" width="auto" trigger="hover" content="更换为风格介绍嵌入页面">
                    <li className={commonStyles.tag} data-selected={selected[0]} onClick={() => processSelected(0)}>现代</li>
                </Popover>
                    <li className={commonStyles.tag} data-selected={selected[1]} onClick={() => processSelected(1)}>科技</li>
                    <li className={commonStyles.tag} data-selected={selected[2]} onClick={() => processSelected(2)}>卡通/插画</li>
                    <li className={commonStyles.tag} data-selected={selected[3]} onClick={() => processSelected(3)}>写实/摄影</li>
                    <li className={commonStyles.tag} data-selected={selected[4]} onClick={() => processSelected(4)}>装饰</li>
                    <li className={commonStyles.tag} data-selected={selected[5]} onClick={() => processSelected(5)}>复古/古典</li>
                    <li className={commonStyles.tag} data-selected={selected[6]} onClick={() => processSelected(6)}>简约</li>
                </ul>
            </div>
        </div>
    );
};
