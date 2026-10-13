import api from "../../utils/axios.js";

export const getMyPayments = async () => {
  try {
    const { data } = await api.get("/api/billing/my-payments");
    return data; // { success, data: [...] }
  } catch (error) {
    console.log("getMyPayments error:", error);
    return { success: false, data: [] };
  }
};