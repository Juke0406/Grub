import axios from "axios";
import { Item } from "../types.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5000";

export class AIService {
  static async analyzeImage(image: File): Promise<{
    category: string;
    description: string;
    condition: string;
  }> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  static async predictPrice(item: Item): Promise<number> {
    const response = await axios.post(`${AI_SERVICE_URL}/predict-price`, {
      category: item.category,
      condition: item.condition,
      brand: item.brand,
      age: item.age,
    });

    return response.data.price;
  }

  static async generateDescription(item: Item): Promise<string> {
    const response = await axios.post(
      `${AI_SERVICE_URL}/generate-description`,
      {
        category: item.category,
        brand: item.brand,
        condition: item.condition,
        features: item.features,
      }
    );

    return response.data.description;
  }
}
