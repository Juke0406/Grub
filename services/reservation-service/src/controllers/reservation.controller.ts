import { Request, Response } from "express";
import { Reservation, ReservationStatus } from "../models/reservation.model";
import { Product } from "../models/product.model";
import { ApiError } from "../middleware/error.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import {
  publishReservationCreated,
  publishReservationUpdated,
  publishReservationCancelled,
  publishProductUpdated,
} from "../kafka";
import { updateProductInventory } from "../handlers/product.handler";
import { logger } from "../utils/logger";

/**
 * Get all reservations for a user
 * @route GET /api/reservations/v1
 * @access Private
 */
export const getReservations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const status = req.query.status as string | undefined;
    const limit = parseInt((req.query.limit as string) || "10");
    const page = parseInt((req.query.page as string) || "1");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId };
    if (status) {
      const statusArray = status.split(",");
      query.status = { $in: statusArray };
    }

    // Get reservations
    const reservations = await Reservation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        reservations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get a single reservation
 * @route GET /api/reservations/v1/:id
 * @access Private
 */
export const getReservation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const reservationId = req.params.id;

    // Get reservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
    });

    if (!reservation) {
      throw new ApiError(404, "Reservation not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        reservation,
      },
    });
  }
);

/**
 * Create a new reservation
 * @route POST /api/reservations/v1
 * @access Private
 */
export const createReservation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const { storeName, storeLocation, items, pickupTime, pickupEndTime } =
      req.body;

    // Validate items availability
    for (const item of items) {
      const product = await Product.findOne({ SKU: item.productId });

      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`);
      }

      if (product.inventory.quantity < item.quantity) {
        throw new ApiError(
          400,
          `Not enough stock for ${product.name}. Available: ${product.inventory.quantity}`
        );
      }
    }

    // Create reservation
    const reservation = new Reservation({
      userId,
      storeName,
      storeLocation,
      items,
      status: ReservationStatus.PENDING,
      pickupTime,
      pickupEndTime,
      createdAt: new Date().toISOString(),
    });

    await reservation.save();

    // Update product inventory
    for (const item of items) {
      await updateProductInventory(item.productId, -item.quantity);

      // Publish product updated event
      const product = await Product.findOne({ SKU: item.productId });
      if (product) {
        await publishProductUpdated({
          SKU: product.SKU,
          inventory: {
            quantity: product.inventory.quantity,
            expirationDate: product.inventory.expirationDate,
          },
        });
      }
    }

    // Publish reservation created event
    await publishReservationCreated({
      reservationId: reservation._id,
      userId,
      storeName,
      storeLocation,
      items,
      status: ReservationStatus.PENDING,
      pickupTime,
      pickupEndTime,
      createdAt: reservation.createdAt,
    });

    res.status(201).json({
      status: "success",
      data: {
        reservation,
      },
    });
  }
);

/**
 * Update reservation status
 * @route PATCH /api/reservations/v1/:id/status
 * @access Private
 */
export const updateReservationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const reservationId = req.params.id;
    const { status } = req.body;

    // Get reservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
    });

    if (!reservation) {
      throw new ApiError(404, "Reservation not found");
    }

    // Check if status transition is valid
    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.PENDING]: [
        ReservationStatus.CONFIRMED,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.CONFIRMED]: [
        ReservationStatus.READY,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.READY]: [
        ReservationStatus.COMPLETED,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.COMPLETED]: [],
      [ReservationStatus.CANCELLED]: [],
    };

    if (
      !validTransitions[reservation.status].includes(
        status as ReservationStatus
      )
    ) {
      throw new ApiError(
        400,
        `Cannot transition from ${reservation.status} to ${status}`
      );
    }

    // If cancelling, restore inventory
    if (status === ReservationStatus.CANCELLED) {
      for (const item of reservation.items) {
        await updateProductInventory(item.productId, item.quantity);

        // Publish product updated event
        const product = await Product.findOne({ SKU: item.productId });
        if (product) {
          await publishProductUpdated({
            SKU: product.SKU,
            inventory: {
              quantity: product.inventory.quantity,
              expirationDate: product.inventory.expirationDate,
            },
          });
        }
      }

      // Publish reservation cancelled event
      await publishReservationCancelled({
        reservationId: reservation._id,
        userId,
        status: ReservationStatus.CANCELLED,
      });
    }

    // Update reservation status
    reservation.status = status as ReservationStatus;
    await reservation.save();

    // Publish reservation updated event
    await publishReservationUpdated({
      reservationId: reservation._id,
      userId,
      status,
    });

    res.status(200).json({
      status: "success",
      data: {
        reservation,
      },
    });
  }
);

/**
 * Add rating to a completed reservation
 * @route POST /api/reservations/v1/:id/rating
 * @access Private
 */
export const addRating = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const reservationId = req.params.id;
  const { rating } = req.body;

  // Get reservation
  const reservation = await Reservation.findOne({
    _id: reservationId,
    userId,
  });

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  // Check if reservation is completed
  if (reservation.status !== ReservationStatus.COMPLETED) {
    throw new ApiError(400, "Can only rate completed reservations");
  }

  // Check if already rated
  if (reservation.rating) {
    throw new ApiError(400, "Reservation already rated");
  }

  // Add rating
  reservation.rating = {
    score: rating.score,
    comment: rating.comment || "",
    createdAt: new Date().toISOString(),
  };

  await reservation.save();

  // Publish reservation updated event
  await publishReservationUpdated({
    reservationId: reservation._id,
    userId,
    rating: reservation.rating,
  });

  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});
