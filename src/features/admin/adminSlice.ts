import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { error } from "../../utils/notify";

interface User {
    _id: string;
    username: string;
    role: string;
    avatar: string;
    invitecode: string;
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
    globalProgress: {
        labeled_count: number;
        allocated_count: number;
        imgCount: number;
    };
}

const initialState: AdminState = {
    users: [],
    tasks: [],
    globalProgress: {
        labeled_count: 0,
        allocated_count: 0,
        imgCount: 0,
    },
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

export const fetchGlobalProgress = createAsyncThunk(
    "admin/fetchGlobalProgress",
    async () => {
        const res1 = await axios.get("/task/global_progress");
        const res2 = await axios.get("/imgs/count");
        console.log("fetchGlobalProgress", res1, res2);
        if (res1.status === 200 && res2.status === 200) {
            return {
                labeled_count: res1.data.data.labeled_count,
                allocated_count: res1.data.data.allocated_count,
                imgCount: res2.data.data,
            };
        } else {
            error("Failed to fetch global progress");
            return initialState.globalProgress;
        }
    }
);

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
            })
            .addCase(fetchGlobalProgress.pending, (state, action) => {
                state.globalProgress = {
                    ...initialState.globalProgress,
                };
            })
            .addCase(fetchGlobalProgress.fulfilled, (state, action) => {
                console.log(action.payload);
                state.globalProgress = { ...action.payload };
            });
    },
});

export const { setUsers } = AdminSlice.actions;

export default AdminSlice.reducer;
