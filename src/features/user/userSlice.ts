import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit'
import { v4 } from 'uuid'

type UserType = {
    id: string,
    username: string,
    invitecode?: string,
    avatar: string
}

export const initState: UserType = {
    id: "",
    username: "",
    invitecode: "",
    avatar: "",
}

// async login template 1
export const setLoginAsync = createAsyncThunk(
    'user/setLoginAsync',
    async (user: UserType) => {
        const response = await fetch(`/api/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user
            })
        })
        const data = await response.json()
        return data
    }
)
// template 2
export const setLoginFaker = createAsyncThunk(
    'user/setLoginFaker',
    async (user: UserType) => {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        const data:Array<any> = await response.json()
        return data[0]
    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState: initState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<UserType>) => {
            state.id = action.payload.id
            state.username = action.payload.username
            state.avatar = action.payload.avatar
            state.invitecode = action.payload.invitecode
        },
    }
})


export const { setUserInfo } = userSlice.actions
export default userSlice.reducer