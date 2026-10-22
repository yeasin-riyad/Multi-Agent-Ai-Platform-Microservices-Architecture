import redis from "../../../shared/redis/redis.js";

const Limits = {
  chat: 20,
  coding: 5,
  pdf: 5,
  ppt: 5,
  image: 5,
  search: 5,
};

const WINDOW_SECONDS = 60;

export const checkAgentLimit = async (userId, agent) => {
  const max = Limits[agent] ?? Limits.chat;
  const key = `rate:${userId}:${agent}`;

  // প্রথম request হলে counter তৈরি হবে এবং 60-second expiry সেট হবে
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(key);

  if (count > max) {
    return {
      allowed: false,
      limit: max,
      remaining: 0,
      retryAfter: Math.max(ttl, 1),
      message: `Rate limit exceeded for ${agent} agent. Try again in ${Math.max(ttl, 1)} seconds.`,
    };
  }

  return {
    allowed: true,
    limit: max,
    remaining: max - count,
    retryAfter: 0,
  };
};