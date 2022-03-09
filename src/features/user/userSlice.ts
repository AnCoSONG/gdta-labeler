import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit'
import { v4 } from 'uuid'

type UserType = {
    id: string,
    username: string,
    password?: string,
    invitecode?: string,
    login?: boolean
}

export const initState: UserType = {
    id: "",
    username: "",
    password: "",
    invitecode: "",
    login: false
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
        setLogin: (state, action: PayloadAction<UserType>) => {
            state.id = v4()
            // 实际情况调用这些去获取 id
            state.username = action.payload.username
            state.password = action.payload.password
            state.invitecode = action.payload.invitecode
            state.login = true
            console.log(`user ${state.username} logged in`)
        },
        setLogout: (state) => {
            state.login = false
            console.log(`user ${state.username} logged out`)
        }
    }
})


export const { setLogin, setLogout } = userSlice.actions
export default userSlice.reducer