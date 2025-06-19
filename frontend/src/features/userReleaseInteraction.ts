import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {fetchUserReleaseInteraction} from "../processes/fetchUserReleaseInteraction.ts";
import {deleteSavedReleaseByUser} from "../processes/deleteSavedReleaseByUser.ts";
import {saveReleaseByUser} from "../processes/saveReleaseByUser.ts";
import {deleteUserRating} from "../processes/deleteUserRating.ts";
import {saveUserRating} from "../processes/saveUserRating.ts";
import {deleteReview} from "../processes/deleteReview.ts";
import {saveReview} from "../processes/saveReview.ts";
import {Dispatch} from "react";

interface UserReleaseInteraction {
    releaseId: string;
    isSaved: boolean;
    userRating: number | null;
    userReview: string;
}

interface UserReleaseInteractionState {
    interactions: Record<string, UserReleaseInteraction>;
    loading: boolean;
    error: string | null;
}

const initialState: UserReleaseInteractionState = {
    interactions: {},
    loading: false,
    error: null
};

interface SetLoadingAction {
      payload: boolean;
      type: string;
}

interface SetInteractionAction {
    payload: {
        releaseId: string;
        interaction: Partial<UserReleaseInteraction>;
    };
    type: string;
}

interface SetErrorAction {
     payload: string | null;
     type: string;
}

type DispatchAction = SetLoadingAction | SetInteractionAction | SetErrorAction;

export const userReleaseInteractionSlice = createSlice({
    name: 'userReleaseInteraction',
    initialState,
    reducers: {
        setInteraction: (state, action: PayloadAction<{releaseId: string; interaction: Partial<UserReleaseInteraction>}>) => {
            const { releaseId, interaction } = action.payload;
            if (!state.interactions[releaseId]) {
                state.interactions[releaseId] = {
                    releaseId,
                    isSaved: false,
                    userRating: null,
                    userReview: ''
                };
            }
            state.interactions[releaseId] = {
                ...state.interactions[releaseId],
                ...interaction
            };
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const fetchUserInteraction =
    (releaseId: string, userId: string): (dispatch: Dispatch<DispatchAction>) =>
        Promise<void> =>
        async (dispatch) => {
            try {
                dispatch(setLoading(true));
                const { isSaved, userRating, userReview } = await fetchUserReleaseInteraction(releaseId, userId);

                dispatch(setInteraction({
                    releaseId,
                    interaction: {
                        isSaved,
                        userRating,
                        userReview: userReview || ''
                    }
                }));
            } catch (error) {
                dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch user interaction'));
            } finally {
                dispatch(setLoading(false));
            }
};

export const toggleSaveRelease =
    (releaseId: string, isCurrentlySaved: boolean): (dispatch: Dispatch<DispatchAction>) =>
        Promise<void> =>
        async (dispatch) => {
            try {
                if (isCurrentlySaved) {
                    await deleteSavedReleaseByUser(releaseId);
                } else {
                    await saveReleaseByUser(releaseId);
                }

                dispatch(setInteraction({
                    releaseId,
                    interaction: {
                        isSaved: !isCurrentlySaved
                    }
                }));
            } catch (error) {
                dispatch(setError(error instanceof Error ? error.message : 'Failed to toggle save release'));
            }
        };

export const updateUserRating =
    (releaseId: string, rating: number | null): (dispatch: Dispatch<DispatchAction>) =>
        Promise<void> =>
        async (dispatch) => {
            try {
                if (rating === null) {
                    await deleteUserRating(releaseId);
                } else {
                    await saveUserRating(releaseId, rating);
                }

                dispatch(setInteraction({
                    releaseId,
                    interaction: {
                        userRating: rating
                    }
                }));
            } catch (error) {
                dispatch(setError(error instanceof Error ? error.message : 'Failed to update rating'));
            }
        };

export const updateUserReview =
    (releaseId: string, review: string): (dispatch: Dispatch<DispatchAction>) =>
        Promise<void> =>
        async (dispatch) => {
            try {
                if (review === '') {
                    await deleteReview(releaseId);
                } else {
                    await saveReview(releaseId, review);
                }

                dispatch(setInteraction({
                    releaseId,
                    interaction: {
                        userReview: review
                    }
                }));
            } catch (error) {
                dispatch(setError(error instanceof Error ? error.message : 'Failed to update review'));
            }
        };

export const { setInteraction, setLoading, setError } = userReleaseInteractionSlice.actions;

export default userReleaseInteractionSlice.reducer;