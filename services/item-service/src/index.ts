import { serve } from "@hono/node-server";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "./db/index.js";
import { categories, items } from "./db/schema.js";
import { authMiddleware, corsMiddleware } from "./middleware.js";
import { Env, Location } from "./types.js";
import {
  deleteImage,
  generateImageKey,
  generateImageUrls,
  generatePresignedUrl,
} from "./utils/storage.js";

const app = new Hono<Env>();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4002;

// Apply middleware
app.use("*", corsMiddleware);
app.use("/api/*", authMiddleware);

// Health check
app.get("/", (c) => c.text("Item Service Running"));

// Category endpoints
app.get("/api/categories", async (c) => {
  try {
    const allCategories = await db.select().from(categories).execute();
    return c.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Item endpoints
app.post("/api/items", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const {
      title,
      description,
      price,
      condition,
      categoryId,
      location,
    }: {
      title: string;
      description: string;
      price: number;
      condition: string;
      categoryId: string;
      location: Location;
    } = body;

    const [item] = await db
      .insert(items)
      .values({
        userId,
        title,
        description,
        price: price.toString(),
        condition,
        categoryId,
        location,
        images: [],
      })
      .returning();

    return c.json(item, 201);
  } catch (error) {
    console.error("Error creating item:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/items", async (c) => {
  try {
    const { categoryId, userId } = c.req.query();
    let conditions = [];

    if (categoryId) {
      conditions.push(eq(items.categoryId, categoryId));
    }
    if (userId) {
      conditions.push(eq(items.userId, userId));
    }

    const allItems = await db
      .select()
      .from(items)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .execute();

    const itemsWithUrls = await Promise.all(
      allItems.map(async (item) => ({
        ...item,
        images: await generateImageUrls(item.images),
      }))
    );

    return c.json(itemsWithUrls);
  } catch (error) {
    console.error("Error fetching items:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/items/:id", async (c) => {
  try {
    const itemId = c.req.param("id");
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    const itemWithUrls = {
      ...item,
      images: await generateImageUrls(item.images),
    };

    return c.json(itemWithUrls);
  } catch (error) {
    console.error("Error fetching item:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.put("/api/items/:id", async (c) => {
  try {
    const itemId = c.req.param("id");
    const userId = c.get("userId");
    const body = await c.req.json();

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (item.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const [updatedItem] = await db
      .update(items)
      .set(body)
      .where(eq(items.id, itemId))
      .returning();

    return c.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/items/:id", async (c) => {
  try {
    const itemId = c.req.param("id");
    const userId = c.get("userId");

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (item.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Delete images from storage
    if (item.images) {
      await Promise.all(item.images.map((image) => deleteImage(image.key)));
    }

    await db.delete(items).where(eq(items.id, itemId)).execute();

    return c.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Image upload endpoints
app.post("/api/items/:id/images/upload-url", async (c) => {
  try {
    const itemId = c.req.param("id");
    const userId = c.get("userId");
    const { filename } = await c.req.json<{ filename: string }>();

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (item.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const key = generateImageKey(userId, filename);
    const uploadUrl = await generatePresignedUrl(key);

    return c.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/api/items/:id/images", async (c) => {
  try {
    const itemId = c.req.param("id");
    const userId = c.get("userId");
    const { key, isPrimary } = await c.req.json<{
      key: string;
      isPrimary: boolean;
    }>();

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (item.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const newImages = [...(item.images || [])];

    if (isPrimary) {
      newImages.forEach((img) => (img.isPrimary = false));
    }

    newImages.push({
      key,
      url: "", // Will be generated when fetching
      isPrimary: isPrimary || newImages.length === 0,
    });

    const [updatedItem] = await db
      .update(items)
      .set({ images: newImages })
      .where(eq(items.id, itemId))
      .returning();

    return c.json(updatedItem);
  } catch (error) {
    console.error("Error adding image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/items/:id/images/:key", async (c) => {
  try {
    const itemId = c.req.param("id");
    const imageKey = c.req.param("key");
    const userId = c.get("userId");

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .execute();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (item.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (!item.images) {
      return c.json({ error: "Image not found" }, 404);
    }

    const imageIndex = item.images.findIndex((img) => img.key === imageKey);

    if (imageIndex === -1) {
      return c.json({ error: "Image not found" }, 404);
    }

    await deleteImage(imageKey);

    const updatedImages = [...item.images];
    updatedImages.splice(imageIndex, 1);

    // If we deleted the primary image, make the first remaining image primary
    if (item.images[imageIndex].isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    const [updatedItem] = await db
      .update(items)
      .set({ images: updatedImages })
      .where(eq(items.id, itemId))
      .returning();

    return c.json(updatedItem);
  } catch (error) {
    console.error("Error deleting image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

console.log(`Item service listening on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
