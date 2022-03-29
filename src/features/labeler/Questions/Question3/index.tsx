// import styles from "./Question3.module.scss";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectAll, setLabelData } from "../../LabelSlice";
import commonStyles from "../Common.module.scss";

export const Question3 = () => {
    const state = useAppSelector((state) => state.labeler.labelData.q3);
    const valid = useAppSelector((state) => state.labeler.labelData.q1)
    const dispatch = useAppDispatch()
    return (
        <div className={commonStyles.question_card} data-inactive={!valid} onDoubleClick={() => {
            dispatch(selectAll("q3"))
        }}>
            <div className={commonStyles.question_card_title}>
                3. 这幅作品的受众包括哪些性别?(多选)
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                    <li className={commonStyles.tag} data-selected={state[0]} onClick={() => {
                        dispatch(setLabelData({question: "q3", data: {idx: 0, data: !state[0]}}))
                    }}>男性</li>
                    <li className={commonStyles.tag} data-selected={state[1]} onClick={() => {
                        dispatch(setLabelData({question: "q3", data: {idx: 1, data: !state[1]}}))
                    }}>女性</li>
                </ul>
            </div>
        </div>
    );
};
