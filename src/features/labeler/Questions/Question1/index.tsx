// import styles from './index.module.scss';
import commonStyles from '../Common.module.scss';
// import {LabelDataPayload} from '../../LabelSlice'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setLabelData } from '../../LabelSlice'
export const Question1 = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(state => state.labeler.labelData.q1)
    return (
        <div className={commonStyles.question_card}>
            <div className={commonStyles.question_card_title}>
                1. 这幅作品是否有效？
            </div>
            <div
                className={commonStyles.line_btn}
                onClick={() => dispatch(setLabelData({question: "q1", data: true}))}
                data-selected={state}
            >
                是
            </div>
            <div
                className={commonStyles.line_btn}
                onClick={() => dispatch(setLabelData({question: "q1", data: false}))}
                data-selected={!state}
                data-last
            >
                否
            </div>
        </div>
    );
};
