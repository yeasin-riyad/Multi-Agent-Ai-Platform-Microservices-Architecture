import api from "../../utils/axios.js";

export const getPaymentById = async (paymentId) => {
  try {
    const { data } = await api.get(`/api/billing/payment/${paymentId}`);
    return data;
  } catch (error) {
    console.log("getPaymentById error:", error);
    return null;
  }
};