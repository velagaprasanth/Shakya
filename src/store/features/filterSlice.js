import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedCategory: "",
    sortValue: ""
};

export const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        handleSort: (state, action) => {
            state.sortValue = action.payload;
        },
        handleCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        clearFilters: (state) => {
            state.selectedCategory = "";
            state.sortValue = "";
        }
    },
});

export const filterReducer = filterSlice.reducer;
export const { handleSort, handleCategory, clearFilters } =
    filterSlice.actions;