import { User, UserRole } from "../models/user.model";
import { logger } from "../utils/logger";

/**
 * Handle user created event from Kafka
 * Creates a new user in the reservation service database
 */
export const handleUserCreatedEvent = async (data: any): Promise<void> => {
  try {
    const {
      userId,
      email,
      firstName,
      lastName,
      role,
      businessName,
      businessAddress,
      phoneNumber,
    } = data.data;

    logger.info(`Processing user created event for user ${userId}`);

    // Check if user already exists
    const existingUser = await User.findById(userId);
    if (existingUser) {
      logger.warn(`User ${userId} already exists, skipping creation`);
      return;
    }

    // Create new user
    const user = new User({
      _id: userId,
      email,
      firstName,
      lastName,
      role: role || UserRole.CONSUMER,
      ...(businessName && { businessName }),
      ...(businessAddress && { businessAddress }),
      ...(phoneNumber && { phoneNumber }),
    });

    await user.save();
    logger.info(`User ${userId} created successfully`);
  } catch (error) {
    logger.error("Error handling user created event:", error);
    throw error;
  }
};

/**
 * Handle user updated event from Kafka
 * Updates an existing user in the reservation service database
 */
export const handleUserUpdatedEvent = async (data: any): Promise<void> => {
  try {
    const {
      userId,
      email,
      firstName,
      lastName,
      role,
      businessName,
      businessAddress,
      phoneNumber,
    } = data.data;

    logger.info(`Processing user updated event for user ${userId}`);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User ${userId} not found, creating instead of updating`);
      await handleUserCreatedEvent(data);
      return;
    }

    // Update user fields
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;

    if (businessName) user.businessName = businessName;
    if (businessAddress) user.businessAddress = businessAddress;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();
    logger.info(`User ${userId} updated successfully`);
  } catch (error) {
    logger.error("Error handling user updated event:", error);
    throw error;
  }
};
