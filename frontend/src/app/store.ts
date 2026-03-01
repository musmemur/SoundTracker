import {configureStore, ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import loadAuthUserReducer from '../features/loadAuthUser.ts';
import userReleaseInteractionReducer from '../features/userReleaseInteraction.ts';

const store = configureStore({
    reducer: {
        loadAuthUser: loadAuthUserReducer,
        userReleaseInteraction: userReleaseInteractionReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

export default store;
