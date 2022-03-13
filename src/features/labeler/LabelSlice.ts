import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabelHistory = {
    id: string,
    title: string,
    imgsrc: string
}

export type LabelData = {
    q1: boolean,
    // 现代, 科技, 卡通/插画, 写实/摄影, 装饰, 复古/古典, 简约
    q2: boolean[],
    q3: boolean[],
    q4: boolean[]
}

export type LabelDataForMultiple = {
    idx: number,
    data: boolean
}

export type LabelDataPayload = {
    question: "q1" | "q2" | "q3" | "q4",
    data: boolean | LabelDataForMultiple
}

type LabelSliceType = {
    history: LabelHistory[],
    labelData: LabelData
}

export const initState: LabelSliceType = {
    history: [{
        id: "123",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    {
        id: "456",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    {
        id: "456",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    {
        id: "456",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    {
        id: "456",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    {
        id: "456",
        title: "image title",
        imgsrc: "https://picsum.photos/200/300"
    },
    ],
    labelData: {
        q1: true,
        q2: [false, false, false, false, false, false, false],
        q3: [false, false],
        q4: [false, false, false, false, false]
    }
}

export const labelSlice = createSlice({
    name: 'label',
    initialState: initState,
    reducers: {
        addHistory: (state, action: PayloadAction<LabelHistory>) => {
            state.history.push(action.payload)
        },
        setLabelData: (state, action: PayloadAction<LabelDataPayload>) => {
            console.log(action.type)
            switch(action.payload.question) {
                case "q1":
                    if(typeof action.payload.data === 'boolean')
                        state.labelData.q1 = action.payload.data
                    else {
                        throw Error('q1 data type error')
                    }
                    break
                case "q2":
                    if(typeof action.payload.data === 'object'){
                        state.labelData.q2[(action.payload.data as LabelDataForMultiple).idx] = (action.payload.data as LabelDataForMultiple).data
                    }else{
                        throw Error('q2 data type error')
                    }
                    break
                case "q3":
                    if(typeof action.payload.data === 'object'){
                        state.labelData.q3[(action.payload.data as LabelDataForMultiple).idx] = (action.payload.data as LabelDataForMultiple).data
                    }else{
                        throw Error('q3 data type error')
                    }
                    break
                case "q4":
                    if(typeof action.payload.data === 'object'){
                        state.labelData.q4[(action.payload.data as LabelDataForMultiple).idx] = (action.payload.data as LabelDataForMultiple).data
                    }else{
                        throw Error('q4 data type error')
                    }
                    break
                default:
                    break
            }
                
            
        }
    }
})

export const {addHistory, setLabelData} = labelSlice.actions
export default labelSlice.reducer