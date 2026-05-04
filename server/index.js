import "dotenv/config";
import { env } from "./config/env.js";
import { createServer } from "./server.js";

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`DrivePDF API listening on http://localhost:${env.PORT}`);
});
