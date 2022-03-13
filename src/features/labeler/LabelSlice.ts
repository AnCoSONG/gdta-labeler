import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LabelHistory = {
    id: string,
    title: string,
    imgsrc: string
}

type LabelSliceType = {
    history: LabelHistory[]
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
]
}

export const labelSlice = createSlice({
    name: 'label',
    initialState: initState,
    reducers: {
        addHistory: (state, action: PayloadAction<LabelHistory>) => {
            state.history.push(action.payload)
        }
    }
})

export const {addHistory} = labelSlice.actions
export default labelSlice.reducer