import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedCategory: "",
    selectedSubcategory: "",
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
            state.selectedSubcategory = ""; // Reset subcategory when category changes
        },
        handleSubcategory: (state, action) => {
            state.selectedSubcategory = action.payload;
        },
        clearFilters: (state) => {
            state.selectedCategory = "";
            state.selectedSubcategory = "";
            state.sortValue = "";
        }
    },
});

export const filterReducer = filterSlice.reducer;
export const { handleSort, handleCategory, handleSubcategory, clearFilters } =
    filterSlice.actions;