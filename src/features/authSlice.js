import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../store/apiSlice';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addMatcher(
        apiSlice.endpoints.register.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        apiSlice.endpoints.register.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.user = {
            _id: action.payload._id,
            username: action.payload.username,
            email: action.payload.email,
          };
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
        }
      )
      .addMatcher(
        apiSlice.endpoints.register.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.data?.message || action.error?.message || 'Registration failed';
        }
      )
      // Login
      .addMatcher(
        apiSlice.endpoints.login.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        apiSlice.endpoints.login.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.user = {
            _id: action.payload._id,
            username: action.payload.username,
            email: action.payload.email,
          };
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
        }
      )
      .addMatcher(
        apiSlice.endpoints.login.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.data?.message || action.error?.message || 'Login failed';
        }
      )
      // Load User
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchRejected,
        (state) => {
          state.loading = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
        }
      );
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
