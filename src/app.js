const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const serviceRecordRoutes = require("./routes/serviceRecordRoutes");
const { swaggerSpec } = require("./config/swagger");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/service-records", serviceRecordRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "WarrantyVault" });
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
  });

  app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    res.status(status).json({
      message: error.message || "Unexpected server error"
    });
  });

  return app;
}

module.exports = { createApp };
