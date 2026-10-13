import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyPayments as getMyPaymentsApi} from "../features/getMyPayments";
import { createOrder as createOrderApi} from "../features/createOrder";


export const fetchMyPayments = createAsyncThunk(
  "billing/fetchMyPayments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyPaymentsApi();
      return res?.data || [];
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load payments");
    }
  },
);

export const startPayment = createAsyncThunk(
  "billing/startPayment",
  async ({ plan, name, email, phone }, { rejectWithValue }) => {
    try {
      const res = await createOrderApi({ plan, name, email, phone });
      return res;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Payment failed to start",
      );
    }
  },
);

/* ── Slice ──────────────────────────────────────────────────────── */

const initialState = {
  payments: [],
  loadingHistory: false,

  // Buying state
  buyingPlan: null, // e.g. "starter" | "pro" | "elite" | null

  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
    },
    resetBuyingState: (state) => {
      state.buyingPlan = null;
    },
  },
  extraReducers: (builder) => {
    /* fetchMyPayments */
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.loadingHistory = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loadingHistory = false;
        state.payments = action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = action.payload;
      });

    /* startPayment */
    builder
      .addCase(startPayment.pending, (state, action) => {
        state.buyingPlan = action.meta.arg.plan;
        state.error = null;
      })
      .addCase(startPayment.fulfilled, (state) => {
        state.buyingPlan = null;
      })
      .addCase(startPayment.rejected, (state, action) => {
        state.buyingPlan = null;
        state.error = action.payload;
      });
  },
});

export const { clearBillingError, resetBuyingState } = billingSlice.actions;
export default billingSlice.reducer;