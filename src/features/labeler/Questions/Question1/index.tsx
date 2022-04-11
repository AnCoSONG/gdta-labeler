// import styles from './index.module.scss';
import commonStyles from '../Common.module.scss';
// import {LabelDataPayload} from '../../LabelSlice'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setLabelData, ValidType } from '../../LabelSlice'
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
                onClick={() => dispatch(setLabelData({question: "q1", data: ValidType.Valid}))}
                data-selected={state === ValidType.Valid}
            >
                有效
            </div>
            <div
                className={commonStyles.line_btn + " " + commonStyles.after_process}
                onClick={() => dispatch(setLabelData({question: "q1", data: ValidType.ValidAfterProcessing}))}
                data-selected={state === ValidType.ValidAfterProcessing}
            >
                处理后有效
            </div>
            <div
                className={commonStyles.line_btn + " " + commonStyles.invalid }
                onClick={() => dispatch(setLabelData({question: "q1", data: ValidType.Invalid}))}
                data-selected={state === ValidType.Invalid}
                data-last
            >
                无效
            </div>
        </div>
    );
};
