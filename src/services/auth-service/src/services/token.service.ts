import jwt from "jsonwebtoken";
import { config } from "../config";
import { IUser } from "../models/user.model";
import { setWithExpiry, getValue, deleteKey } from "../redis";
import { logger } from "../utils/logger";

// Token types
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

// Token payload interface
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: TokenType;
}

/**
 * Generate JWT token
 */
export const generateToken = (
  user: IUser,
  type: TokenType = TokenType.ACCESS
): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    type,
  };

  const expiresIn =
    type === TokenType.ACCESS
      ? config.accessTokenExpiry
      : config.refreshTokenExpiry;

  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch (error) {
    logger.error("Token verification failed:", error);
    return null;
  }
};

/**
 * Store refresh token in Redis
 */
export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    // Calculate expiry in seconds (default 7 days)
    const expiryInSeconds = 7 * 24 * 60 * 60; // 7 days

    // Store token in Redis with user ID as key
    const key = `refresh_token:${userId}`;
    await setWithExpiry(key, token, expiryInSeconds);

    logger.debug(`Refresh token stored for user ${userId}`);
  } catch (error) {
    logger.error("Failed to store refresh token:", error);
    throw error;
  }
};

/**
 * Verify refresh token from Redis
 */
export const verifyRefreshToken = async (
  userId: string,
  token: string
): Promise<boolean> => {
  try {
    const key = `refresh_token:${userId}`;
    const storedToken = await getValue(key);

    if (!storedToken) {
      logger.warn(`No refresh token found for user ${userId}`);
      return false;
    }

    return storedToken === token;
  } catch (error) {
    logger.error("Failed to verify refresh token:", error);
    return false;
  }
};

/**
 * Invalidate refresh token
 */
export const invalidateRefreshToken = async (userId: string): Promise<void> => {
  try {
    const key = `refresh_token:${userId}`;
    await deleteKey(key);
    logger.debug(`Refresh token invalidated for user ${userId}`);
  } catch (error) {
    logger.error("Failed to invalidate refresh token:", error);
    throw error;
  }
};

/**
 * Generate auth tokens (access + refresh)
 */
export const generateAuthTokens = async (
  user: IUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateToken(user, TokenType.ACCESS);
  const refreshToken = generateToken(user, TokenType.REFRESH);

  // Store refresh token in Redis
  await storeRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
  };
};
