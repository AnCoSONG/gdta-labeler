import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axios } from "../../utils";
import { error, success } from "../../utils/notify";

type LabelHistory = {
    id: string;
    title: string;
    imgsrc: string;
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

type LabelSliceType = {
    history: LabelHistory[];
    labelData: LabelData;
    ALLDONE: boolean;
    labelImage: LabelImage;
};

export const initState: LabelSliceType = {
    history: [],
    ALLDONE: false,
    labelData: {
        q1: true,
        q2: [false, false, false, false, false, false, false],
        q3: [false, false],
        q4: [false, false, false, false, false],
    },
    labelImage: {
        _id: "",
        title: "",
        src: "https://dummyimage.com/600x400/fff/000.jpg&text=Please+Wait",
        source: "",
        labeled_count: 0,
        created_time: "",
    },
};

export const fetchImageDataAsync = createAsyncThunk(
    "labeler/fetchImageData",
    async (labeler_id: string) => {
        // 拿取图片之前先把localStorage清空
        const currentImg = localStorage.getItem("currentImg");
        let unfishedImgID = null;
        if (currentImg){
            unfishedImgID = JSON.parse(currentImg)._id;
            localStorage.removeItem("currentImg");
            console.log("已清除currentImg记录");
        }
        let response;
        if (unfishedImgID && unfishedImgID !== "" && unfishedImgID !== 'Thanks') {
            console.log('正在恢复上次未完成的图片');
            response = await axios.get(`/imgs/${unfishedImgID}`);
        } else {
            console.log('正在获取新的待打标图像');
            response = await axios.get("/imgs/next", {params: {labeler_id: labeler_id}});
        }
        // The value we return becomes the `fulfilled` action payload
        console.log("fetchImageData", response);
        if (response.status === 200) {
            if (response.data.data === 'all done') {
                success('您已打标完成全部打标内容！打标界面已锁定，您可以自行退出.', 5000)
                // all done image
                return {
                    _id: "Thanks",
                    title: "All Done",
                    src: "https://dummyimage.com/600x400/fff/000.jpg&text=All+Done",
                    source: "corporations!",
                    author: "for",
                    labeled_count: 0,
                    created_time: "your",
                };
            }
            return response.data.data as LabelImage;
        
        } else {
            // error('请求出错，请联系管理员')
            console.error("请求出错");
            return {} as LabelImage;
        }
    }
);

export const labelSlice = createSlice({
    name: "label",
    initialState: initState,
    reducers: {
        addHistory: (state, action: PayloadAction<LabelHistory>) => {
            state.history.push(action.payload);
        },
        setLabelData: (state, action: PayloadAction<LabelDataPayload>) => {
            // console.log(action.type);
            switch (action.payload.question) {
                case "q1":
                    if (typeof action.payload.data === "boolean") {
                        // q1会清空其他选项
                        state.labelData = { ...initState.labelData };
                        state.labelData.q1 = action.payload.data;
                    } else {
                        throw Error("q1 data type error");
                    }
                    break;
                case "q2":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q2[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw Error("q2 data type error");
                    }
                    break;
                case "q3":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q3[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw Error("q3 data type error");
                    }
                    break;
                case "q4":
                    if (typeof action.payload.data === "object") {
                        state.labelData.q4[
                            (action.payload.data as LabelDataForMultiple).idx
                        ] = (action.payload.data as LabelDataForMultiple).data;
                    } else {
                        throw Error("q4 data type error");
                    }
                    break;
                default:
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImageDataAsync.pending, (state) => {})
            .addCase(
                fetchImageDataAsync.fulfilled,
                (state, action: PayloadAction<LabelImage>) => {
                    if (action.payload._id === "Thanks") {
                        console.log('Thanks payload,', action.payload)
                        state.ALLDONE = true;
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
                }
            );
    },
});

export const { addHistory, setLabelData } = labelSlice.actions;
export default labelSlice.reducer;
