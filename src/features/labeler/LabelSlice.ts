import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axios } from "../../utils";
import { success } from "../../utils/notify";

export const stylesMapping =
    "简约/简洁,科技/科幻,复古/古典,卡通/插画/建模,复杂/装饰,写实/摄影,字体排印,其他".split(
        ","
    );
export const i18nstyleMapping =
    "Minimalism,Tech/Sci-Fi,Vintage,Cartoon / Illustration / Modeling,Decoration,Realism,Typography,Other".split(
        ","
    );

export const contents = [
    "以少量的设计元素组合的平面设计形式，常常辅以留白来传达空旷的意境或激发读者的想象。",
    "利用具有科技感的视觉元素，如芯片、电子、通讯、网络、荧光、太空等，营造出先锋、前沿的视觉体验。",
    "流行于上个世纪或更早的设计形式，带给现代人传统、复古的观看体验。",
    "以手绘(2D)、建模(3D)作为主要技法的设计形式，通常以夸张的人物或动物作为设计主体。",
    "以大量装饰元素的堆叠作为主要的设计方法，展现出华丽、复杂的观感。",
    "以摄影或拟真的图像作为设计的主要元素，传达出具象、真实的观感。",
    "画面以字体以及字体排版为主要设计元素的风格",
    "不属于以上7个风格",
];
export const genderMapping = "男性,女性".split(",");
export const agesMapping = "青少年,青年,壮年,中年,老年".split(",");

export enum STAGE {
    ALL = 0,
    ONLY_VALID = 1,
    ONLY_STYLE = 2,
}

export enum ValidType {
    Valid = 0,
    ValidAfterProcessing = 1,
    Invalid = 2,
}
export type LabelHistory = {
    _id: string;
    img_id: string;
    img_title: string;
    img_src: string;
    valid: number;
    finished: boolean;
    styles: boolean[];
    audience_age: boolean[];
    audience_gender: boolean[];
};

export type LabelData = {
    q1: ValidType;
    // 简约/简洁,科技,复古/古典,卡通/插画,复杂/装饰,写实/摄影,字体设计,其他
    q2: boolean[];
    q3: boolean[];
    q4: boolean[];
};

export type LabelImage = {
    _id: string;
    title: string;
    src: string;
    author?: string;
    tags?: Array<string>;
    labeled_count: number;
    width: number;
    height: number;
    source: string;
    project_url: string;
    created_time: string;
};

export type LabelDataForMultiple = {
    idx: number;
    data: boolean;
};

export type LabelDataPayload = {
    question: "q1" | "q2" | "q3" | "q4";
    data: number | LabelDataForMultiple;
};

type HistoryPayload = {
    count: number;
    history: LabelHistory[];
};

type LabelSliceType = {
    history: LabelHistory[];
    count: number;
    labelData: LabelData;
    labelImage: LabelImage;
    labelImageLoaded: boolean;
    done: boolean;
    stage: STAGE;
};

export const initState: LabelSliceType = {
    history: [],
    count: 20,
    labelData: {
        q1: 0,
        q2: [false, false, false, false, false, false, false, false],
        q3: [false, false],
        q4: [false, false, false, false, false],
    },
    labelImage: {
        _id: "",
        title: "",
        src: "",
        source: "",
        width: 0,
        height: 0,
        project_url: "",
        labeled_count: 0,
        created_time: "",
    },
    labelImageLoaded: false,
    done: false,
    stage: STAGE.ONLY_VALID, // change this to make effect on post.
};

export const fetchImageDataAsync = createAsyncThunk(
    "labeler/fetchImageData",
    async (labeler_id: string) => {
        // 拿取图片之前先把localStorage清空
        console.log("正在获取新的待打标图像", labeler_id);
        let response = await axios.get("/task/next", {
            params: { labeler_id: labeler_id },
        });
        console.log("fetchImageData", response);
        if (response.status === 200) {
            if (response.data.message === "all done") {
                success("您已打标完成当前全部打标内容！", 2000);
                // all done image
                return {
                    _id: "Thanks",
                    title: "All Done",
                    src: "https://dummyimage.com/600x400/fff/000.jpg&text=All+Done",
                    source: "cooperation!",
                    author: "for",
                    width: 600,
                    height: 400,
                    project_url: "",
                    labeled_count: 0,
                    created_time: "your",
                };
            } else if (response.data.message === "Skip") {
                success("该图像是您之前跳过的图像，请您再尝试打标", 2000);
            }
            return response.data.data.img as LabelImage;
        } else {
            // error('请求出错，请联系管理员')
            console.error("请求出错");
            return {} as LabelImage;
        }
    }
);

export const fetchHistoryAsync = createAsyncThunk(
    "labeler/fetchHistory",
    async (args: {
        labeler_id: string;
        page: number;
        limit: number;
        query_type: string;
    }) => {
        let response = await axios.post("/record/list", {
            labeler_id: args.labeler_id,
            page: args.page,
            limit: args.limit,
            query_type: args.query_type,
        });
        if (response.status === 201 || response.status === 200) {
            console.log("fetch history async response", response);
            return {
                history: response.data.data.pageData,
                count: response.data.data.count,
            } as HistoryPayload;
        } else {
            console.error("请求出错");
            return {
                history: [],
                count: 0,
            } as HistoryPayload;
        }
    }
);

export const fetchLabelImageWithIDAsync = createAsyncThunk(
    "labeler/fetchLabelImageWithID",
    async (img_id: string) => {
        let response = await axios.get(`/imgs/${img_id}`).catch((e) => {
            console.error(e.name);
        });
        if (response) {
            if (response.status === 200) {
                console.log("fetchLabelImageWithIDAsync", response.data);
                return response.data.data as LabelImage;
            } else {
                console.error("fetchLabelImageWithIDAsync: 请求出错");
                return {} as LabelImage;
            }
        } else {
            console.error("fetchLabelImageWithIDAsync: 请求出错");
            return {} as LabelImage;
        }
    }
);

export const labelSlice = createSlice({
    name: "label",
    initialState: initState,
    reducers: {
        setLabelData: (state, action: PayloadAction<LabelDataPayload>) => {
            // console.log(action.type);
            switch (action.payload.question) {
                case "q1":
                    if (typeof action.payload.data === "number") {
                        // q1会清空其他选项
                        state.labelData = { ...initState.labelData };
                        state.labelData.q1 = action.payload.data;
                    } else {
                        throw new Error("q1 data type error");
                    }
                    break;
                case "q2":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q2[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw new Error("q2 data type error");
                    }
                    break;
                case "q3":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q3[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw new Error("q3 data type error");
                    }
                    break;
                case "q4":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q4[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw new Error("q4 data type error");
                    }
                    break;
                default:
                    break;
            }
        },
        setLabelDataAsObject: (state, action: PayloadAction<LabelData>) => {
            // 这个接口就当成更新数据用的
            state.labelData = { ...action.payload };
            console.log(state.labelData);
        },
        selectAll: (state, action: PayloadAction<string>) => {
            switch (action.payload) {
                case "q3":
                    const q3hasTrue = state.labelData.q3.some((e) => e);
                    if (q3hasTrue) {
                        state.labelData.q3.fill(false);
                    } else {
                        state.labelData.q3.fill(true);
                    }
                    break;
                case "q4":
                    const q4hasTrue = state.labelData.q4.some((e) => e);
                    if (q4hasTrue) {
                        state.labelData.q4.fill(false);
                    } else {
                        state.labelData.q4.fill(true);
                    }
                    break;
                default:
                    break;
            }
        },
        initLabelerState: (state) => {
            state.history = [];
            state.count = initState.count;
            state.labelData = { ...initState.labelData };
            state.labelImage = { ...initState.labelImage };
            // console.log("inited", state);
        },
        setLabelImageLoadedStatus: (state, action: PayloadAction<boolean>) => {
            state.labelImageLoaded = action.payload;
        },
        updateHistoryStateAtIdx: (
            state,
            action: PayloadAction<{ idx: number; valid: ValidType }>
        ) => {
            state.history[action.payload.idx].valid = action.payload.valid;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImageDataAsync.pending, (state) => {
                state.labelImageLoaded = false;
                // 拿新图片，labelData数据要清空
                state.labelData = { ...initState.labelData };
                state.labelImage = { ...initState.labelImage };
            })
            .addCase(
                fetchImageDataAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    console.log(action.payload);
                    state.labelImage = { ...action.payload };
                    state.done = false;
                    // state.labelImageLoaded = true;
                    if (action.payload._id === "Thanks") {
                        console.log("Thanks payload,", action.payload);
                        state.done = true;
                    }
                }
            )
            .addCase(fetchHistoryAsync.pending, (state) => {})
            .addCase(
                fetchHistoryAsync.fulfilled,
                (state, action: PayloadAction<HistoryPayload>) => {
                    console.log("history", action.payload);
                    state.history = [...action.payload.history];
                    state.count = action.payload.count;
                }
            )
            .addCase(fetchLabelImageWithIDAsync.pending, (state) => {
                state.labelImageLoaded = false;
                state.labelImage = { ...initState.labelImage };
            })
            .addCase(
                fetchLabelImageWithIDAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    console.log("fetchLabelImageWithID", action.payload);
                    state.labelImage = { ...action.payload };
                    state.done = false;
                    // state.labelImageLoaded = true;
                }
            );
    },
});

export const {
    setLabelData,
    initLabelerState,
    setLabelDataAsObject,
    setLabelImageLoadedStatus,
    selectAll,
    updateHistoryStateAtIdx,
} = labelSlice.actions;
export default labelSlice.reducer;
