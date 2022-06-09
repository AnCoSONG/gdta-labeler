import commonStyles from "../labeler/Questions/Common.module.scss";
import { Popover } from "element-react/next";
import {
    contents,
    i18nstyleMapping,
    setLabelData,
    stylesMapping,
    ValidType,
} from "./StyleLabelerSlice";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

type PropType = {
    no: number;
}
export const Question2 = (prop: PropType) => {
    const state = useAppSelector((state) => state.labeler.labelData.q2);
    const valid = useAppSelector((state) => state.labeler.labelData.q1);
    const dispatch = useAppDispatch();
    return (
        <div
            className={commonStyles.question_card}
            data-inactive={valid === ValidType.Invalid}
        >
            <div className={commonStyles.question_card_title}>
               {prop.no}. 这幅作品属于哪些风格?(多选)
            </div>
            <div className={commonStyles.question_card_content}>
                <ul className={commonStyles.tags}>
                    {new Array(8).fill(0).map((item, index) => {
                        return (
                            <li
                                className={commonStyles.tag}
                                data-selected={state[index]}
                                onClick={() =>
                                    dispatch(
                                        setLabelData({
                                            question: "q2",
                                            data: {
                                                idx: index,
                                                data: !state[index],
                                            },
                                        })
                                    )
                                }
                            >
                                <span className={commonStyles.tag_text}>
                                    {stylesMapping[index] +
                                        " " +
                                        i18nstyleMapping[index]}
                                </span>
                                <Popover
                                    placement="top-start"
                                    title={
                                        stylesMapping[index] +
                                        " " +
                                        i18nstyleMapping[index]
                                    }
                                    trigger="hover"
                                    content={contents[index]}
                                >
                                    <span className={commonStyles.tag_info}>
                                        <FontAwesomeIcon
                                            icon={faInfoCircle}
                                        ></FontAwesomeIcon>
                                    </span>
                                </Popover>
                            </li>
                        );
                    })}
                    {/* <Popover placement="top-start" title={stylesMapping[0]+" " + i18nstyleMapping[0]} trigger="hover" content="以少量的设计元素组合的平面设计形式，常常辅以留白来传达空旷的意境或激发读者的想象。">
                    <li className={commonStyles.tag} data-selected={state[0]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 0, data: !state[0]} }))}>{stylesMapping[0]+" " + i18nstyleMapping[0]}</li>
                </Popover>
                <Popover placement="top-start" title={stylesMapping[1]+" " + i18nstyleMapping[1]} trigger="hover" content="利用具有科技感的视觉元素，如芯片、电子、通讯、网络、荧光、太空等，营造出先锋、前沿的视觉体验。">
                    <li className={commonStyles.tag} data-selected={state[1]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 1, data: !state[1]} }))}>{stylesMapping[1]+" " + i18nstyleMapping[1]}</li>
                </Popover>
                <Popover placement="top-start" title="复古/古典 Vintage" trigger="hover" content="流行于上个世纪或更早的设计形式，带给现代人传统、复古的观看体验。">
                    <li className={commonStyles.tag} data-selected={state[2]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 2, data: !state[2]} }))}>复古/古典</li>
                </Popover>
                <Popover placement="top-start" title="卡通/插画 Cartoon/Illustration" trigger="hover" content="以手绘作为主要技法的设计形式，通常以夸张的人物或动物作为设计主体。">
                    <li className={commonStyles.tag} data-selected={state[3]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 3, data: !state[3]} }))}>卡通/插画</li>
                </Popover>
                <Popover placement="top-start" title="复杂/装饰 Decoration" trigger="hover" content="以大量装饰元素的堆叠作为主要的设计方法，展现出华丽、复杂的观感。">
                    <li className={commonStyles.tag} data-selected={state[4]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 4, data: !state[4]} }))}>复杂/装饰</li>
                </Popover>
                <Popover placement="top-start" title="写实/摄影 Photolism" trigger="hover" content="以摄影或拟真的图像作为设计的主要元素，传达出具象、真实的观感。">
                    <li className={commonStyles.tag} data-selected={state[5]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 5, data: !state[5]} }))}>写实/摄影</li>
                </Popover>
                <Popover placement="top-start" title="字体排印 Typography" trigger="hover" content="画面以字体以及字体排版为主要设计元素的风格">
                    <li className={commonStyles.tag} data-selected={state[6]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 6, data: !state[6]} }))}>字体排印</li>
                </Popover>
                <Popover placement="top-start" title="其他 Other" trigger="hover" content="不属于以上7个风格">
                    <li className={commonStyles.tag} data-selected={state[6]} onClick={() => dispatch(setLabelData({question: "q2", data: {idx: 7, data: !state[6]} }))}>其他</li>
                </Popover> */}
                </ul>
            </div>
        </div>
    );
};

export default Question2;
