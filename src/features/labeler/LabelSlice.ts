import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axios } from "../../utils";
import { success } from "../../utils/notify";

export const stylesMapping =
    "现代,科技,卡通/插画,写实/摄影,装饰,复古/古典,简约".split(",");
export const genderMapping = "男性,女性".split(",");
export const agesMapping = "青少年,青年,壮年,中年,老年".split(",");

export type LabelHistory = {
    _id: string;
    img_id: string;
    img_title: string;
    img_src: string;
    valid: boolean;
    finished: boolean;
    styles: boolean[];
    audience_age: boolean[];
    audience_gender: boolean[];
};

export type LabelData = {
    q1: boolean;
    // 现代, 科技, 卡通/插画, 写实/摄影, 装饰, 复古/古典, 简约
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
    source: string;
    created_time: string;
};

export type LabelDataForMultiple = {
    idx: number;
    data: boolean;
};

export type LabelDataPayload = {
    question: "q1" | "q2" | "q3" | "q4";
    data: boolean | LabelDataForMultiple;
};

type HistoryPayload = {
    count: number;
    history: LabelHistory[];
}

type LabelSliceType = {
    history: LabelHistory[];
    count: number;
    labelData: LabelData;
    labelImage: LabelImage;
    editing: boolean;
};

export const initState: LabelSliceType = {
    history: [],
    count: 20,
    labelData: {
        q1: true,
        q2: [false, false, false, false, false, false, false],
        q3: [false, false],
        q4: [false, false, false, false, false],
    },
    labelImage: {
        _id: "",
        title: "",
        src: "",
        source: "",
        labeled_count: 0,
        created_time: "",
    },
    editing: false,
};

export const fetchImageDataAsync = createAsyncThunk(
    "labeler/fetchImageData",
    async (labeler_id: string) => {
        // 拿取图片之前先把localStorage清空
        console.log("正在获取新的待打标图像");
        let response = await axios.get("/imgs/next", {
            params: { labeler_id: labeler_id },
        });
        console.log("fetchImageData", response);
        if (response.status === 200) {
            if (response.data.message === "all done") {
                success(
                    "您已打标完成全部打标内容！打标界面已锁定，您可以自行退出.",
                    5000
                );
                // all done image
                return {
                    _id: "Thanks",
                    title: "All Done",
                    src: "https://dummyimage.com/600x400/fff/000.jpg&text=All+Done",
                    source: "cooperation!",
                    author: "for",
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
        }else {
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
                    if (typeof action.payload.data === "boolean") {
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
            state.labelData = {...action.payload}
            state.editing = true;
            console.log(state.labelData);
        },
        initLabelerState: (state) => {
            state.history = [];
            state.count = initState.count;
            state.editing = false;
            state.labelData = { ...initState.labelData };
            state.labelImage = { ...initState.labelImage };
            console.log("inited", state);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImageDataAsync.pending, (state) => {})
            .addCase(
                fetchImageDataAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    if (action.payload._id === "Thanks") {
                        console.log("Thanks payload,", action.payload);
                    }
                    console.log(action.payload);
                    state.labelImage._id = action.payload._id;
                    state.labelImage.author = action.payload.author;
                    state.labelImage.created_time = action.payload.created_time;
                    state.labelImage.labeled_count =
                        action.payload.labeled_count;
                    state.labelImage.source = action.payload.source;
                    state.labelImage.src = action.payload.src;
                    state.labelImage.title = action.payload.title;
                    state.labelImage.tags = action.payload.tags;
                    // 拿到新图片，labelData数据要清空
                    state.labelData = { ...initState.labelData };

                    // 拿到新图像就把edit模式关掉
                    state.editing = false;
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
            .addCase(fetchLabelImageWithIDAsync.pending, (state) => {})
            .addCase(
                fetchLabelImageWithIDAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    console.log('fetchLabelImageWithID', action.payload);
                    state.labelImage = {...action.payload};
                }
            );
    },
});

export const { setLabelData, initLabelerState, setLabelDataAsObject } = labelSlice.actions;
export default labelSlice.reducer;
