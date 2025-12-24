"use client";
import { createSlice } from "@reduxjs/toolkit";

/**
 * Cart slice for managing sauna configurations
 *
 * Cart item structure:
 * {
 *   id: string,              // Unique cart item ID (productId + config hash)
 *   productId: string,       // MongoDB product ID
 *   name: string,            // Product name
 *   image: string,           // Primary image URL
 *   price: number,           // Total calculated price
 *   qty: number,             // Quantity
 *   configuration: {
 *     size?: { key: string, label: string, price: number },
 *     woodType?: { name: string, price: number },
 *     stove?: { name: string, price: number, wifi?: boolean },
 *     installation?: { name: string, price: number },
 *     delivery?: { cost: number, included: boolean },
 *     upgrades: Array<{ name: string, price: number }>
 *   },
 *   selectedOptions: object  // Legacy field for backward compatibility
 * }
 */

// Create Initial State
const initialState = {
  cartItems: [],
};

const AddDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// Create the slice with Reducers
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Check if Item Exists by ID (which includes configuration hash)
      const existingItem = state.cartItems.find((x) => x.id === item.id);

      if (existingItem) {
        // Update existing item (replace with new data)
        state.cartItems = state.cartItems.map((x) =>
          x.id === existingItem.id
            ? { ...item, qty: existingItem.qty + (item.qty || 1) }
            : x
        );
      } else {
        // Add new item
        state.cartItems = [...state.cartItems, { ...item, qty: item.qty || 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      const cartId = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== cartId);
      localStorage.setItem("cart", JSON.stringify(state));
    },

    updateCartItemQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.cartItems.find((item) => item.id === id);
      if (item) {
        item.qty = qty;
        localStorage.setItem("cart", JSON.stringify(state));
      }
    },

    updateCartItemConfiguration: (state, action) => {
      const { id, configuration, price } = action.payload;
      const item = state.cartItems.find((item) => item.id === id);
      if (item) {
        item.configuration = configuration;
        item.price = price;
        localStorage.setItem("cart", JSON.stringify(state));
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.setItem("cart", JSON.stringify(state));
    },

    hydrateCart: (state) => {
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          // Migrate old cart items to new structure if needed
          if (parsed.cartItems) {
            state.cartItems = parsed.cartItems.map((item) => ({
              ...item,
              // Ensure configuration exists
              configuration: item.configuration || {
                upgrades: [],
              },
            }));
          }
        }
      }
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
export const selectCartItemCount = (state) =>
  state.cart.cartItems.reduce((acc, item) => acc + item.qty, 0);

// Export the reducers (actions)
export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemConfiguration,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
