import {
  createAsyncThunk,
  createSelector,
  createSlice,
  SerializedError,
} from "@reduxjs/toolkit";

import { RootState, ThunkExtra } from "./rootStore";
import { selectToken } from "./token";

export interface VoteState {
  voteError?: SerializedError;
  voteLoading: boolean;
  voteResult?: "SUCCESS";
}

export const initialState: VoteState = {
  voteError: undefined,
  voteLoading: false,
  voteResult: undefined,
};

export const recordVote = createAsyncThunk<void, string, ThunkExtra>(
  "vote/recordVote",
  async (identifier, { getState, extra: { api }, dispatch }) => {
    const { token, captchaToken } = selectToken(getState() as RootState);
    const { ballot } = selectBallot(getState() as RootState);

    if (!ballot || !token || !captchaToken) {
      return;
    }

    await api.voteApi.recordVote(identifier, ballot._id, token, captchaToken);
  }
);

export const voteSlice = createSlice({
  name: "vote",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(recordVote.pending, (state) => {
      state.voteError = undefined;
      state.voteLoading = true;
    });
    builder.addCase(recordVote.fulfilled, (state, action) => {
      state.voteLoading = false;
    });
    builder.addCase(recordVote.rejected, (state, action) => {
      state.voteError = action.error;
      state.voteLoading = false;
    });
  },
});

export const { reducer } = voteSlice;
export const actions = {
  ...voteSlice.actions
};

export const selectBallotStore = (state: RootState) => state.ballot;

export const selectBallot = createSelector(selectBallotStore, (store) => ({
  ballot: store.runningBallot,
  ballotLoading: store.ballotLoading,
  ballotError: store.ballotError,
}));
