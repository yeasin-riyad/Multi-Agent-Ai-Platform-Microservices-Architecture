import axios from "axios";

// ⚠️ এটা এখন AUTH_SERVICE_URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export const AGENT_COST = {
  chat: 1,
  search: 5,
  coding: 10,
  pdf: 10,
  ppt: 10,
  vision: 10,
};

export class CreditError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "CreditError";
    this.code = code;
    this.details = details;
  }
}

export async function deductCredits({ userId, agent }) {
  if (!userId) throw new CreditError("userId is required", "MISSING_USER_ID");
  if (!agent) throw new CreditError("agent is required", "MISSING_AGENT");

  const cost = AGENT_COST[agent];
  if (typeof cost !== "number") {
    throw new CreditError(
      `Unknown agent: "${agent}"`,
      "UNKNOWN_AGENT",
      { validAgents: Object.keys(AGENT_COST) },
    );
  }

  try {
    const { data } = await axios.post(
      // ⚠️ Auth service-এর URL/path
      `${AUTH_SERVICE_URL}/api/auth/deduct-credits`,
      { userId, agent },
      {
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET,
        },
        timeout: 5000,
      },
    );

    return {
      cost: data.cost,
      remaining: data.remaining,
      plan: data.plan,
      message: data.message,
    };
  } catch (error) {
    const status = error?.response?.status;
    const apiData = error?.response?.data;

    if (!status) {
      throw new CreditError(
        "Could not reach auth service.",
        "SERVICE_UNAVAILABLE",
      );
    }
    if (status === 402) {
      throw new CreditError(
        apiData?.message || "Insufficient credits",
        "INSUFFICIENT_CREDITS",
        { required: apiData?.required, available: apiData?.available },
      );
    }
    if (status === 403) {
      throw new CreditError(
        apiData?.message || "Plan expired",
        "PLAN_EXPIRED",
        { planExpiresAt: apiData?.planExpiresAt },
      );
    }
    if (status === 404) {
      throw new CreditError(apiData?.message || "User not found", "USER_NOT_FOUND");
    }
    if (status >= 500) {
      throw new CreditError("Auth service error", "SERVICE_ERROR");
    }
    throw new CreditError(apiData?.message || `Deduct failed (${status})`, "DEDUCT_FAILED");
  }
}

export default deductCredits;