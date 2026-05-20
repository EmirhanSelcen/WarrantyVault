const { loadEnv } = require("./src/config/env");
const { createApp } = require("./src/app");
const { initializeDatabase } = require("./src/db/database");

loadEnv();

const port = process.env.PORT || 3000;

async function start() {
  await initializeDatabase();
  const app = createApp();

  app.listen(port, () => {
    console.log(`WarrantyVault is running at http://localhost:${port}`);
    console.log(`Swagger docs are available at http://localhost:${port}/api-docs`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
