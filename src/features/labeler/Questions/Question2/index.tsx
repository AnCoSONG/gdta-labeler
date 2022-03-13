import commonStyles from "../Common.module.scss";
import { Popover } from "element-react";
import { setLabelData } from '../../LabelSlice'
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

export const Question2 = () => {
    const state = useAppSelector((state) => state.labeler.labelData.q2);
    const valid = useAppSelector(state => state.labeler.labelData.q1)
    const dispatch = useAppDispatch()
    return (
        <div className={commonStyles.question_card} data-inactive={!valid}>
            <div className={commonStyles.question_card_title}>
                2. 这幅作品属于哪些风格?(多选)
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                <Popover placement="top-start" title="简约 Minimalism" width="auto" trigger="hover" content="以少量的设计元素组合的平面设计形式，常常辅以留白来传达空旷的意境或激发读者的想象。">
                    <li className={commonStyles.tag} data-selected={state[0]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 0, data: !state[0]} }))}>简约/简洁</li>
                </Popover>
                <Popover placement="top-start" title="科技感 Tech" width="auto" trigger="hover" content="利用具有科技感的视觉元素，如芯片、电子、通讯、网络、荧光、太空等，营造出先锋、前沿的视觉体验。">
                    <li className={commonStyles.tag} data-selected={state[1]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 1, data: !state[1]} }))}>科技感</li>
                </Popover>
                <Popover placement="top-start" title="复古/古典 Vintage" width="auto" trigger="hover" content="流行于上个世纪或更早的设计形式，带给现代人传统、复古的观看体验。">
                    <li className={commonStyles.tag} data-selected={state[2]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 2, data: !state[2]} }))}>复古/古典</li>
                </Popover>
                <Popover placement="top-start" title="卡通/插画 Cartoon" width="auto" trigger="hover" content="以手绘作为主要技法的设计形式，通常以夸张的人物或动物作为设计主体。">
                    <li className={commonStyles.tag} data-selected={state[3]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 3, data: !state[3]} }))}>卡通/插画</li>
                </Popover>
                <Popover placement="top-start" title="装饰 Decoration" width="auto" trigger="hover" content="以大量装饰元素的堆叠作为主要的设计方法，展现出华丽、复杂的观感。">
                    <li className={commonStyles.tag} data-selected={state[4]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 4, data: !state[4]} }))}>装饰</li>
                </Popover>
                <Popover placement="top-start" title="写实 Realism" width="auto" trigger="hover" content="以摄影或拟真的图像作为设计的主要元素，传达出具象、真实的观感。">
                    <li className={commonStyles.tag} data-selected={state[5]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 5, data: !state[5]} }))}>写实</li>
                </Popover>
                <Popover placement="top-start" title="现代 Modern" width="auto" trigger="hover" content="近几年的平面设计流行趋势，更加年轻的设计表达。">
                    <li className={commonStyles.tag} data-selected={state[6]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 6, data: !state[6]} }))}>现代</li>
                </Popover>
                </ul>
            </div>
        </div>
    );
};
