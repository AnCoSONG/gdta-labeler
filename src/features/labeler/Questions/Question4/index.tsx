// import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { setLabelData } from "../../LabelSlice";
import commonStyles from "../Common.module.scss";

export const Question4 = () => {
    const state = useAppSelector((state) => state.labeler.labelData.q4);
    const valid = useAppSelector((state) => state.labeler.labelData.q1);
    const dispatch = useAppDispatch();
    return (
        <div className={commonStyles.question_card} data-inactive={!valid}>
            <div className={commonStyles.question_card_title}>
                4. 这幅作品的受众包括哪些年龄段？（多选）
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                    <li
                        className={commonStyles.tag}
                        data-selected={state[0]}
                        onClick={() => {
                            dispatch(
                                setLabelData({
                                    question: "q4",
                                    data: { idx: 0, data: !state[0] },
                                })
                            );
                        }}
                    >
                        青少年(~17)
                    </li>
                    <li
                        className={commonStyles.tag}
                        data-selected={state[1]}
                        onClick={() => {
                            dispatch(
                                setLabelData({
                                    question: "q4",
                                    data: { idx: 1, data: !state[1] },
                                })
                            );
                        }}
                    >
                        青年(18~28)
                    </li>
                    <li
                        className={commonStyles.tag}
                        data-selected={state[2]}
                        onClick={() => {
                            dispatch(
                                setLabelData({
                                    question: "q4",
                                    data: { idx: 2, data: !state[2] },
                                })
                            );
                        }}
                    >
                        壮年(29~44)
                    </li>
                    <li
                        className={commonStyles.tag}
                        data-selected={state[3]}
                        onClick={() => {
                            dispatch(
                                setLabelData({
                                    question: "q4",
                                    data: { idx: 3, data: !state[3] },
                                })
                            );
                        }}
                    >
                        中年(45~64)
                    </li>
                    <li
                        className={commonStyles.tag}
                        data-selected={state[4]}
                        onClick={() => {
                            dispatch(
                                setLabelData({
                                    question: "q4",
                                    data: { idx: 4, data: !state[4] },
                                })
                            );
                        }}
                    >
                        老年(65~)
                    </li>
                </ul>
            </div>
        </div>
    );
};
