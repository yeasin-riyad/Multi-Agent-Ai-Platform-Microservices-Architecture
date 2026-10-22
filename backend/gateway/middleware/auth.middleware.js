import jwt from "jsonwebtoken";
import redis from "../../shared/redis/redis.js";

const protect = async (req, res, next) => {
  try {
    // 1. Get JWT from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // 2. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    // 3. Get Redis session ID for this user
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: Invalid user",
      });
    }

    const sessionId = await redis.get(
      `user-session-${userId}`,
    );

    if (!sessionId) {
      return res.status(401).json({
        message: "Unauthorized: Session expired",
      });
    }

    // 4. Verify that the Redis session still exists
    const sessionData = await redis.get(
      `session-${sessionId}`,
    );

    if (!sessionData) {
      return res.status(401).json({
        message: "Unauthorized: Session expired",
      });
    }

    // 5. Attach session user to request
    const session = JSON.parse(sessionData);

    // Ensure the session belongs to the JWT user
    if (String(session.userId) !== String(userId)) {
      return res.status(401).json({
        message: "Unauthorized: Invalid session",
      });
    }

    req.user = session;

    // 6. Continue
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Unauthorized: Token has expired"
            : "Unauthorized: Invalid token",
      });
    }

    console.error("Protect error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default protect;