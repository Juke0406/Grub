import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import config from "../config";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: config.swagger.title,
      version: config.swagger.version,
      description: config.swagger.description,
      contact: {
        name: "Grub Support",
        email: "support@grub.example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: config.swagger.serverUrl,
        description: "API Service",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Enter API key",
        },
      },
      schemas: {
        ApiKey: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "API key ID",
            },
            userId: {
              type: "string",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "API key name",
            },
            description: {
              type: "string",
              description: "API key description",
            },
            tier: {
              type: "string",
              enum: ["standard", "premium", "enterprise"],
              description: "API key tier",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Expiry date",
            },
            lastUsedAt: {
              type: "string",
              format: "date-time",
              description: "Last used date",
            },
            usageCount: {
              type: "integer",
              description: "Usage count",
            },
            isActive: {
              type: "boolean",
              description: "Whether the API key is active",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "API key permissions",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update date",
            },
          },
        },
        CreateApiKeyRequest: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: {
              type: "string",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "API key name",
            },
            description: {
              type: "string",
              description: "API key description",
            },
            tier: {
              type: "string",
              enum: ["standard", "premium", "enterprise"],
              description: "API key tier",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Expiry date",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "API key permissions",
            },
          },
        },
        CreateApiKeyResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Success message",
            },
            key: {
              type: "string",
              description: "API key",
            },
            id: {
              type: "string",
              description: "API key ID",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Expiry date",
            },
            tier: {
              type: "string",
              enum: ["standard", "premium", "enterprise"],
              description: "API key tier",
            },
            name: {
              type: "string",
              description: "API key name",
            },
            description: {
              type: "string",
              description: "API key description",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "API key permissions",
            },
          },
        },
        UpdateApiKeyRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "API key name",
            },
            description: {
              type: "string",
              description: "API key description",
            },
            tier: {
              type: "string",
              enum: ["standard", "premium", "enterprise"],
              description: "API key tier",
            },
            isActive: {
              type: "boolean",
              description: "Whether the API key is active",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "API key permissions",
            },
          },
        },
        VerifyApiKeyRequest: {
          type: "object",
          required: ["key"],
          properties: {
            key: {
              type: "string",
              description: "API key",
            },
          },
        },
        VerifyApiKeyResponse: {
          type: "object",
          properties: {
            valid: {
              type: "boolean",
              description: "Whether the API key is valid",
            },
            userId: {
              type: "string",
              description: "User ID",
            },
            tier: {
              type: "string",
              enum: ["standard", "premium", "enterprise"],
              description: "API key tier",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "API key permissions",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "API Keys",
        description: "API key management",
      },
      {
        name: "Authentication",
        description: "Authentication endpoints",
      },
      {
        name: "Reservations",
        description: "Reservation management",
      },
      {
        name: "Listings",
        description: "Product listing management",
      },
      {
        name: "Predictions",
        description: "Demand prediction and analytics",
      },
      {
        name: "Creation",
        description: "Product and bundle creation",
      },
      {
        name: "ML",
        description: "Machine learning algorithms",
      },
      {
        name: "Integration",
        description: "Third-party integration",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configure Swagger UI
 */
export const setupSwagger = (app: Express): void => {
  // Serve swagger docs
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  // Serve swagger spec as JSON
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
