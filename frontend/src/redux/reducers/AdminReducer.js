import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    loading: true,
    isAdmin: false,
    data: null,
    error: null,
};

export const AdminReducer = createReducer(initialState, (builder) => {
    builder
        .addCase('LoadAdminRequest', (state) => {
            state.loading = true;
        })
        .addCase('LoadAdminSuccess', (state, action) => {
            state.loading = false;
            state.isAdmin = true;
            state.data = action.payload;
            state.error = null;
        })
        .addCase('LoadAdminFail', (state, action) => {
            state.loading = false;
            state.isAdmin = false;
            state.data = null;
            state.error = action.payload;
        })
        .addCase('LogoutAdminSuccess', (state) => {
            state.loading = false;
            state.isAdmin = false;
            state.data = null;
            state.error = null;
        });
});