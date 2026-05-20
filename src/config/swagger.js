const productInputSchema = {
  type: "object",
  required: ["name", "brand", "category", "purchaseDate", "warrantyEndDate"],
  properties: {
    name: { type: "string", example: "Laptop" },
    brand: { type: "string", example: "Lenovo" },
    category: { type: "string", example: "Electronics" },
    purchaseDate: { type: "string", format: "date", example: "2025-09-12" },
    warrantyEndDate: { type: "string", format: "date", example: "2027-09-12" },
    serialNumber: { type: "string", example: "SN-12345" },
    notes: { type: "string", example: "Bought from local store." }
  }
};

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "WarrantyVault API",
    version: "1.0.0",
    description: "JWT protected REST API for tracking products, warranties and service records."
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ProductInput: productInputSchema,
      AuthInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "student@example.com" },
          password: { type: "string", example: "123456" }
        }
      },
      ServiceRecordInput: {
        type: "object",
        required: ["productId", "serviceDate", "provider", "description"],
        properties: {
          productId: { type: "integer", example: 1 },
          serviceDate: { type: "string", format: "date", example: "2026-05-20" },
          provider: { type: "string", example: "Authorized Service" },
          description: { type: "string", example: "Battery replacement" },
          cost: { type: "number", example: 150 }
        }
      }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/AuthInput" },
                  {
                    type: "object",
                    required: ["name"],
                    properties: { name: { type: "string", example: "Student User" } }
                  }
                ]
              }
            }
          }
        },
        responses: { 201: { description: "User registered" } }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Login and receive a JWT",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } }
        },
        responses: { 200: { description: "Login successful" } }
      }
    },
    "/api/products": {
      get: {
        summary: "List current user's products",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "expiringSoon", schema: { type: "string", enum: ["true", "false"] } }
        ],
        responses: { 200: { description: "Product list" } }
      },
      post: {
        summary: "Create a product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } }
        },
        responses: { 201: { description: "Product created" } }
      }
    },
    "/api/products/{id}": {
      get: {
        summary: "Get one product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Product details" }, 404: { description: "Not found" } }
      },
      put: {
        summary: "Update a product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } }
        },
        responses: { 200: { description: "Product updated" } }
      },
      delete: {
        summary: "Delete a product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 204: { description: "Product deleted" } }
      }
    },
    "/api/service-records": {
      get: {
        summary: "List service records",
        tags: ["Service Records"],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "query", name: "productId", schema: { type: "integer" } }],
        responses: { 200: { description: "Service record list" } }
      },
      post: {
        summary: "Create a service record for a product",
        tags: ["Service Records"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceRecordInput" } } }
        },
        responses: { 201: { description: "Service record created" } }
      }
    },
    "/api/service-records/{id}": {
      delete: {
        summary: "Delete a service record",
        tags: ["Service Records"],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 204: { description: "Service record deleted" } }
      }
    }
  }
};

module.exports = { swaggerSpec };
