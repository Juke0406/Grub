import { logger } from "../utils/logger";
import { ModelType } from "../models/ml-model.model";
import { getRedisClient } from "../redis";
import * as math from "mathjs";

/**
 * Service for data collection and preprocessing
 */
export class DataService {
  /**
   * Collect training data for a specific business and model type
   */
  async collectTrainingData(
    businessId: string,
    modelType: ModelType
  ): Promise<{
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  }> {
    try {
      logger.info(`Collecting training data for ${modelType}`, {
        businessId,
        modelType,
      });

      // Different data collection strategies based on model type
      switch (modelType) {
        case ModelType.DEMAND_PREDICTION:
          return await this.collectDemandPredictionData(businessId);
        case ModelType.INVENTORY_FORECAST:
          return await this.collectInventoryForecastData(businessId);
        case ModelType.PRICE_OPTIMIZATION:
          return await this.collectPriceOptimizationData(businessId);
        case ModelType.EXPIRY_PREDICTION:
          return await this.collectExpiryPredictionData(businessId);
        default:
          throw new Error(`Unsupported model type: ${modelType}`);
      }
    } catch (error) {
      logger.error("Error collecting training data", {
        error,
        businessId,
        modelType,
      });
      throw error;
    }
  }

  /**
   * Collect data for demand prediction
   */
  private async collectDemandPredictionData(businessId: string): Promise<{
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  }> {
    // In a real implementation, you would:
    // 1. Query historical sales data from the database
    // 2. Join with other relevant data (e.g., promotions, holidays)
    // 3. Preprocess and transform the data

    // This is a placeholder implementation with synthetic data
    const numSamples = 100;
    const featureNames = [
      "dayOfWeek",
      "isWeekend",
      "isHoliday",
      "discountPercentage",
      "temperature",
      "previousDaySales",
      "averageWeeklySales",
    ];
    const targetName = "dailySales";

    const features: number[][] = [];
    const labels: number[] = [];

    // Generate synthetic data
    for (let i = 0; i < numSamples; i++) {
      const dayOfWeek = Math.floor(Math.random() * 7); // 0-6
      const isWeekend = dayOfWeek >= 5 ? 1 : 0;
      const isHoliday = Math.random() < 0.1 ? 1 : 0; // 10% chance of holiday
      const discountPercentage = Math.floor(Math.random() * 50); // 0-50%
      const temperature = 15 + Math.random() * 20; // 15-35°C
      const previousDaySales = 10 + Math.random() * 90; // 10-100 units
      const averageWeeklySales = 30 + Math.random() * 70; // 30-100 units

      // Feature vector
      const featureVector = [
        dayOfWeek,
        isWeekend,
        isHoliday,
        discountPercentage,
        temperature,
        previousDaySales,
        averageWeeklySales,
      ];

      // Target variable (with some noise)
      const baseSales = 20 + isWeekend * 15 + isHoliday * 25;
      const discountEffect = discountPercentage * 0.5;
      const temperatureEffect = (temperature - 25) * 0.5;
      const trendEffect = previousDaySales * 0.3 + averageWeeklySales * 0.2;
      const noise = Math.random() * 10 - 5; // -5 to 5

      const dailySales = Math.max(
        0,
        Math.round(
          baseSales + discountEffect + temperatureEffect + trendEffect + noise
        )
      );

      features.push(featureVector);
      labels.push(dailySales);
    }

    return { features, labels, featureNames, targetName };
  }

  /**
   * Collect data for inventory forecast
   */
  private async collectInventoryForecastData(businessId: string): Promise<{
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  }> {
    // In a real implementation, you would:
    // 1. Query historical inventory data from the database
    // 2. Join with sales data, supplier data, etc.
    // 3. Preprocess and transform the data

    // This is a placeholder implementation with synthetic data
    const numSamples = 100;
    const featureNames = [
      "month",
      "weekOfYear",
      "averageDailySales",
      "salesTrend",
      "leadTime",
      "previousInventoryLevel",
      "stockoutFrequency",
    ];
    const targetName = "optimalInventoryLevel";

    const features: number[][] = [];
    const labels: number[] = [];

    // Generate synthetic data
    for (let i = 0; i < numSamples; i++) {
      const month = Math.floor(Math.random() * 12) + 1; // 1-12
      const weekOfYear = Math.floor(Math.random() * 52) + 1; // 1-52
      const averageDailySales = 10 + Math.random() * 90; // 10-100 units
      const salesTrend = -10 + Math.random() * 20; // -10% to +10%
      const leadTime = 2 + Math.random() * 5; // 2-7 days
      const previousInventoryLevel = 50 + Math.random() * 200; // 50-250 units
      const stockoutFrequency = Math.random() * 0.2; // 0-20%

      // Feature vector
      const featureVector = [
        month,
        weekOfYear,
        averageDailySales,
        salesTrend,
        leadTime,
        previousInventoryLevel,
        stockoutFrequency,
      ];

      // Target variable (with some noise)
      const baseInventory = averageDailySales * leadTime * 1.5;
      const trendEffect = baseInventory * (salesTrend / 100);
      const safetyStock = averageDailySales * stockoutFrequency * 10;
      const seasonalEffect =
        month >= 11 || month <= 2 ? baseInventory * 0.2 : 0; // Winter effect
      const noise = Math.random() * 20 - 10; // -10 to 10

      const optimalInventoryLevel = Math.max(
        0,
        Math.round(
          baseInventory + trendEffect + safetyStock + seasonalEffect + noise
        )
      );

      features.push(featureVector);
      labels.push(optimalInventoryLevel);
    }

    return { features, labels, featureNames, targetName };
  }

  /**
   * Collect data for price optimization
   */
  private async collectPriceOptimizationData(businessId: string): Promise<{
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  }> {
    // In a real implementation, you would:
    // 1. Query historical pricing and sales data from the database
    // 2. Join with competitor pricing, market data, etc.
    // 3. Preprocess and transform the data

    // This is a placeholder implementation with synthetic data
    const numSamples = 100;
    const featureNames = [
      "productCost",
      "competitorPrice",
      "daysUntilExpiry",
      "currentInventory",
      "demandElasticity",
      "seasonalityIndex",
      "productPopularity",
    ];
    const targetName = "optimalPrice";

    const features: number[][] = [];
    const labels: number[] = [];

    // Generate synthetic data
    for (let i = 0; i < numSamples; i++) {
      const productCost = 2 + Math.random() * 8; // $2-$10
      const competitorPrice = productCost * (1.2 + Math.random() * 0.6); // 120%-180% of cost
      const daysUntilExpiry = Math.floor(Math.random() * 14) + 1; // 1-14 days
      const currentInventory = Math.floor(Math.random() * 100) + 10; // 10-110 units
      const demandElasticity = 0.5 + Math.random() * 2; // 0.5-2.5
      const seasonalityIndex = 0.8 + Math.random() * 0.4; // 0.8-1.2
      const productPopularity = Math.random(); // 0-1

      // Feature vector
      const featureVector = [
        productCost,
        competitorPrice,
        daysUntilExpiry,
        currentInventory,
        demandElasticity,
        seasonalityIndex,
        productPopularity,
      ];

      // Target variable (with some noise)
      const basePrice = productCost * 1.5;
      const competitorEffect = (competitorPrice - basePrice) * 0.3;
      const expiryEffect = -0.5 * (14 - daysUntilExpiry) * (basePrice / 14);
      const inventoryEffect =
        currentInventory > 50 ? -0.1 * basePrice : 0.05 * basePrice;
      const popularityEffect = productPopularity * 0.2 * basePrice;
      const seasonalEffect = (seasonalityIndex - 1) * basePrice;
      const noise = Math.random() * 0.5 - 0.25; // -0.25 to 0.25

      const optimalPrice = Math.max(
        productCost * 1.05,
        basePrice +
          competitorEffect +
          expiryEffect +
          inventoryEffect +
          popularityEffect +
          seasonalEffect +
          noise
      );

      features.push(featureVector);
      labels.push(parseFloat(optimalPrice.toFixed(2)));
    }

    return { features, labels, featureNames, targetName };
  }

  /**
   * Collect data for expiry prediction
   */
  private async collectExpiryPredictionData(businessId: string): Promise<{
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  }> {
    // In a real implementation, you would:
    // 1. Query historical product data from the database
    // 2. Join with sales data, expiry data, etc.
    // 3. Preprocess and transform the data

    // This is a placeholder implementation with synthetic data
    const numSamples = 100;
    const featureNames = [
      "productType",
      "daysUntilExpiry",
      "currentPrice",
      "originalPrice",
      "inventoryLevel",
      "averageDailySales",
      "dayOfWeek",
    ];
    const targetName = "expiryRisk";

    const features: number[][] = [];
    const labels: number[] = [];

    // Generate synthetic data
    for (let i = 0; i < numSamples; i++) {
      const productType = Math.floor(Math.random() * 5); // 0-4 (different product types)
      const daysUntilExpiry = Math.floor(Math.random() * 7) + 1; // 1-7 days
      const originalPrice = 5 + Math.random() * 15; // $5-$20
      const discountPercent = Math.random() * 0.5; // 0-50%
      const currentPrice = originalPrice * (1 - discountPercent);
      const inventoryLevel = 5 + Math.random() * 45; // 5-50 units
      const averageDailySales = 1 + Math.random() * 9; // 1-10 units
      const dayOfWeek = Math.floor(Math.random() * 7); // 0-6

      // Feature vector
      const featureVector = [
        productType,
        daysUntilExpiry,
        currentPrice,
        originalPrice,
        inventoryLevel,
        averageDailySales,
        dayOfWeek,
      ];

      // Target variable (with some noise)
      const salesRatio = averageDailySales / inventoryLevel;
      const daysToSellAll = inventoryLevel / averageDailySales;
      const baseRisk = daysUntilExpiry < daysToSellAll ? 0.8 : 0.2;
      const priceEffect = discountPercent * -0.5; // Higher discount, lower risk
      const dayEffect = dayOfWeek >= 5 ? -0.1 : 0; // Weekend effect
      const noise = Math.random() * 0.2 - 0.1; // -0.1 to 0.1

      const expiryRisk = Math.max(
        0,
        Math.min(1, baseRisk + priceEffect + dayEffect + noise)
      );

      features.push(featureVector);
      labels.push(parseFloat(expiryRisk.toFixed(2)));
    }

    return { features, labels, featureNames, targetName };
  }

  /**
   * Preprocess data for model training
   */
  preprocessData(
    features: number[][],
    labels: number[]
  ): {
    normalizedFeatures: number[][];
    normalizedLabels: number[];
    featureStats: { mean: number[]; std: number[] };
    labelStats: { mean: number; std: number };
  } {
    // Calculate feature statistics
    const featureMeans: number[] = [];
    const featureStds: number[] = [];

    // Calculate mean for each feature
    for (let j = 0; j < features[0].length; j++) {
      const featureValues = features.map((row) => row[j]);
      const mean = math.mean(featureValues);
      const std = math.std(featureValues);
      featureMeans.push(mean);
      featureStds.push(std);
    }

    // Normalize features
    const normalizedFeatures = features.map((row) =>
      row.map((value, j) =>
        featureStds[j] === 0 ? 0 : (value - featureMeans[j]) / featureStds[j]
      )
    );

    // Calculate label statistics
    const labelMean = math.mean(labels);
    const labelStd = math.std(labels);

    // Normalize labels
    const normalizedLabels = labels.map(
      (value) => (value - labelMean) / (labelStd === 0 ? 1 : labelStd)
    );

    return {
      normalizedFeatures,
      normalizedLabels,
      featureStats: { mean: featureMeans, std: featureStds },
      labelStats: { mean: labelMean, std: labelStd },
    };
  }

  /**
   * Split data into training and testing sets
   */
  splitData(
    features: number[][],
    labels: number[],
    testSize = 0.2
  ): {
    trainFeatures: number[][];
    trainLabels: number[];
    testFeatures: number[][];
    testLabels: number[];
  } {
    const numSamples = features.length;
    const numTest = Math.round(numSamples * testSize);
    const numTrain = numSamples - numTest;

    // Shuffle indices
    const indices = Array.from({ length: numSamples }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Split data
    const trainIndices = indices.slice(0, numTrain);
    const testIndices = indices.slice(numTrain);

    const trainFeatures = trainIndices.map((i) => features[i]);
    const trainLabels = trainIndices.map((i) => labels[i]);
    const testFeatures = testIndices.map((i) => features[i]);
    const testLabels = testIndices.map((i) => labels[i]);

    return { trainFeatures, trainLabels, testFeatures, testLabels };
  }
}

// Export singleton instance
export const dataService = new DataService();
