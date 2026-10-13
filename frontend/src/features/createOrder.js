import api from "../../utils/axios";

export const createOrder = async ({ plan, name, email, phone }) => {
  try {
    const { data } = await api.post("/api/billing/create-order", {
      plan,
      name,
      email,
      phone,
    });
    return data; 
  } catch (error) {
    console.log("createOrder error:", error);
    throw error;
  }
};