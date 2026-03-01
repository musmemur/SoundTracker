import {createSlice, ThunkAction, UnknownAction} from '@reduxjs/toolkit'
import {fetchAuthUserData} from "../processes/fetchAuthUserData.ts";
import userPhotoPlaceholder from "../shared/assets/user-photo.svg";
import {User} from "../entities/User.ts";
import {RootState} from "../app/store.ts";

interface UserState {
    value: User | null;
}

const initialState: UserState = {
    value: null
};

const loadAuthUserSlice = createSlice({
    name: "loadAuthUser",
    initialState,
    reducers: {
        setUser: (state = initialState, action) => {
            state.value = action.payload;
        },
        clearUser: (state = initialState) => {
            state.value = null;
        }
    }
});

export const loadAuthUser = (): ThunkAction<void, RootState, unknown, UnknownAction> => async (dispatch) => {
    try {
        const fetchedUser = await fetchAuthUserData();
        fetchedUser.userPhoto = fetchedUser.userPhoto || userPhotoPlaceholder;
        dispatch(setUser(fetchedUser as User));
    } catch {
        dispatch(clearUser());
    }
};

export const { setUser, clearUser } = loadAuthUserSlice.actions;

export default loadAuthUserSlice.reducer;