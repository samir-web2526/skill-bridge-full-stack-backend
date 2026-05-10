import "dotenv/config";
import app from "./app";
import { envVars } from "./config/env";
import { prisma } from "./lib/prisma";

const bootstrap = async () => {
  try {
    await prisma.$connect();
    app.listen(envVars.PORT, () => {
      console.log(`Server running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

bootstrap();