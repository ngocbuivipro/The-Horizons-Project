import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlist: localStorage.getItem("wishlistItems")
    ? JSON.parse(localStorage.getItem("wishlistItems"))
    : [],
};


// WishlistReducer.js
export const WishlistReducer = createReducer(initialState, (builder) => {
    builder
        .addCase('addToWishlist', (state, action) => {
            const item = action.payload;
            const isItemExist = state.wishlist.find((i) => i._id === item._id);

            if (isItemExist) {
                // Replace the old item with the new one
                const index = state.wishlist.findIndex((i) => i._id === isItemExist._id);
                state.wishlist[index] = item;
            } else {
                // Add new item (use push instead of returning a new array)
                state.wishlist.push(item);
            }
            // Persist to localStorage here if needed (side effects should ideally be in middleware but this is acceptable for now)
            localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
        })
        .addCase('removeFromWishlist', (state, action) => {
            // Filter out the item (reassign a new array to state.wishlist)
            state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);
            localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
        })
});
