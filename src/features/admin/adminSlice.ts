import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { error } from "../../utils/notify";

interface User {
    _id: string;
    username: string;
    role: string;
    avatar: string;
}

interface Task {
    _id: string;
    labeler_id: string;
    range: [number, number];
    progress: number;
    finished: boolean;
}

export interface AdminState {
    users: User[];
    tasks: Task[];
}

const initialState: AdminState = {
    users: [],
    tasks: [],
};

export const fetchTasks = createAsyncThunk("admin/fetchTasks", async () => {
    const response = await axios.get("/task");
    console.log("fetchTasks", response);
    if (response.status === 200) {
        return response.data.data as Task[];
    } else {
        error("Failed to fetch tasks");
        return [];
    }
});

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async () => {
    const response = await axios.get("/labeler");
    console.log("fetchUsers", response);
    if (response.status === 200) {
        return response.data.data as User[];
    } else {
        error("Failed to fetch users");
        return [];
    }
});

export const AdminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = [...action.payload];
        },
        setTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = [...action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state, action) => {
                state.tasks = [];
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.tasks = [...action.payload];
                console.log("state.tasks", state.tasks);
            })
            .addCase(fetchUsers.pending, (state, action) => {
                state.users = [];
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = [...action.payload];
                console.log("state.users", state.users);
            });
    },
});

export const { setUsers } = AdminSlice.actions;

export default AdminSlice.reducer;
