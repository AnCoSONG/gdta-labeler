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
    finished: boolean;
    styles: boolean[];
};

export type LabelImage = {
    _id: string;
    title: string;
    src: string;
    author?: string;
    tags?: Array<string>;
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
    question: "q2";
    data: LabelDataForMultiple;
};

type HistoryPayload = {
    count: number;
    history: LabelHistory[];
};

type LabelSliceType = {
    history: LabelHistory[];
    count: number;
    labelData: boolean[];
    labelImage: LabelImage;
    labelImageLoaded: boolean;
    done: boolean;
};

export const initState: LabelSliceType = {
    history: [],
    count: 20,
    labelData: [false, false, false, false, false, false, false, false],
    labelImage: {
        _id: "",
        title: "",
        src: "",
        source: "",
        width: 0,
        height: 0,
        project_url: "",
        created_time: "",
    },
    labelImageLoaded: false,
    done: false,
};

export const fetchImageDataAsync = createAsyncThunk(
    "labeler/fetchImageData",
    async (labeler_id: string) => {
        // 拿取图片之前先把localStorage清空
        console.log("正在获取新的待打标图像", labeler_id);
        let response = await axios.get("/valid-tasks/next", {
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

export const fetchStyleHistoryAsync = createAsyncThunk(
    "labeler/fetchStyleHistory",
    async (args: {
        labeler_id: string;
        page: number;
        limit: number;
        query_type: string;
        img_id: string;
    }) => {
        let response = await axios.post("/valid-records/list", {
            labeler_id: args.labeler_id,
            page: args.page,
            limit: args.limit,
            query_type: args.query_type,
            img_id: args.img_id
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
        let response = await axios.get(`/valid-imgs/${img_id}`).catch((e) => {
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
                case "q2":
                    if (typeof action.payload.data === "object") {
                        state.labelData[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw new Error("q2 data type error");
                    }
                    break;
                default:
                    break;
            }
        },
        setLabelDataAsObject: (state, action: PayloadAction<boolean[]>) => {
            // 这个接口就当成更新数据用的
            state.labelData = [ ...action.payload ];
            console.log(state.labelData);
        },
        initLabelerState: (state) => {
            state.history = [];
            state.count = initState.count;
            state.labelData = [ ...initState.labelData ];
            state.labelImage = { ...initState.labelImage };
            // console.log("inited", state);
        },
        setLabelImageLoadedStatus: (state, action: PayloadAction<boolean>) => {
            state.labelImageLoaded = action.payload;
        },
        updateHistoryStateAtIdx: (
            state,
            action: PayloadAction<{ idx: number; styles: boolean[], finished: boolean}>
        ) => {
            state.history[action.payload.idx].styles = action.payload.styles;
            state.history[action.payload.idx].finished = action.payload.finished;
        },
        updateHistoryStateWithId: (
            state,
            action: PayloadAction<{record_id: string, styles: boolean[], finished: boolean}>
        ) => {
            const idx = state.history.findIndex((item) => item._id === action.payload.record_id) // 找到Idx
            state.history[idx].styles = action.payload.styles;
            state.history[idx].finished = action.payload.finished;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImageDataAsync.pending, (state) => {
                state.labelImageLoaded = false;
                // 拿新图片，labelData数据要清空
                state.labelData = [ ...initState.labelData ];
                state.labelImage = { ...initState.labelImage };
            })
            .addCase(
                fetchImageDataAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    console.log(action.payload);
                    state.labelImage = { ...action.payload };
                    // 拿到新图像就把edit模式关掉
                    state.done = false;
                    // state.labelImageLoaded = true;
                    if (action.payload._id === "Thanks") {
                        console.log("Thanks payload,", action.payload);
                        state.done = true;
                    }
                }
            )
            .addCase(fetchStyleHistoryAsync.pending, (state) => {})
            .addCase(
                fetchStyleHistoryAsync.fulfilled,
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
    updateHistoryStateAtIdx,
    updateHistoryStateWithId
} = labelSlice.actions;
export default labelSlice.reducer;
