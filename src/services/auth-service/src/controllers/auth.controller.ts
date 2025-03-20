import { Request, Response } from "express";
import { User, UserRole } from "../models/user.model";
import {
  generateAuthTokens,
  verifyRefreshToken,
  invalidateRefreshToken,
  verifyToken,
  TokenType,
} from "../services/token.service";
import { ApiError } from "../middleware/error.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { publishUserCreated, publishUserUpdated } from "../kafka";
import { logger } from "../utils/logger";

/**
 * Register a new user
 * @route POST /api/auth/v1/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    businessName,
    businessAddress,
    phoneNumber,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: role || UserRole.CONSUMER,
    ...(businessName && { businessName }),
    ...(businessAddress && { businessAddress }),
    ...(phoneNumber && { phoneNumber }),
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateAuthTokens(user);

  // Publish user created event
  await publishUserCreated({
    userId: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // Return user data and tokens
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ...(user.businessName && { businessName: user.businessName }),
        ...(user.businessAddress && { businessAddress: user.businessAddress }),
        ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Login user
 * @route POST /api/auth/v1/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAuthTokens(user);

  // Return user data and tokens
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ...(user.businessName && { businessName: user.businessName }),
        ...(user.businessAddress && { businessAddress: user.businessAddress }),
        ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/v1/refresh-token
 * @access Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== TokenType.REFRESH) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if token exists in Redis
    const isValid = await verifyRefreshToken(payload.userId, refreshToken);
    if (!isValid) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate new tokens
    const tokens = await generateAuthTokens(user);

    // Return new tokens
    res.status(200).json({
      status: "success",
      data: {
        tokens,
      },
    });
  }
);

/**
 * Logout user
 * @route POST /api/auth/v1/logout
 * @access Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Invalidate refresh token
  await invalidateRefreshToken(userId);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * Get current user
 * @route GET /api/auth/v1/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    // User should be attached to request by auth middleware
    const user = await User.findById(req.body.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          ...(user.businessName && { businessName: user.businessName }),
          ...(user.businessAddress && {
            businessAddress: user.businessAddress,
          }),
          ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
          rating: user.rating,
          ratingCount: user.ratingCount,
        },
      },
    });
  }
);

/**
 * Update user profile
 * @route PATCH /api/auth/v1/profile
 * @access Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      firstName,
      lastName,
      businessName,
      businessAddress,
      phoneNumber,
    } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (businessName) user.businessName = businessName;
    if (businessAddress) user.businessAddress = businessAddress;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Save user
    await user.save();

    // Publish user updated event
    await publishUserUpdated({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      ...(user.businessName && { businessName: user.businessName }),
      ...(user.businessAddress && { businessAddress: user.businessAddress }),
      ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
    });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          ...(user.businessName && { businessName: user.businessName }),
          ...(user.businessAddress && {
            businessAddress: user.businessAddress,
          }),
          ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
        },
      },
    });
  }
);

/**
 * Change password
 * @route POST /api/auth/v1/change-password
 * @access Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;

    // Validate request
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens
    await invalidateRefreshToken(userId);

    // Generate new tokens
    const tokens = await generateAuthTokens(user);

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      data: {
        tokens,
      },
    });
  }
);
