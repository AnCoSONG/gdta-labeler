import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import userReducer from '../features/user/userSlice'
import labelReducer from '../features/labeler/LabelSlice'
import AdminReducer from '../features/admin/adminSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    labeler: labelReducer,
    admin: AdminReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
