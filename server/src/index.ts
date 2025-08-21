import express from "express";
import path from "path";
import userRoutes from "./routes/userRoutes";
import pronunciationRoutes from "./routes/pronunciationRoutes";
import geminiRoutes from "./routes/geminiRoutes";
import genImageRoutes from "./routes/genImageRoutes";
import setupRoute from "./routes/setupRoutes";
import dotenv from "dotenv";
import cors from "cors";
import dashboardRoute from "./routes/dashboardRoute";
import userProfileRoute from "./routes/userProfileRoute"

dotenv.config(); import gameRoutes from './routes/gameRoutes';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.use("/users", userRoutes);
app.use("/pronunciations", pronunciationRoutes);
app.use("/geminis", geminiRoutes);
app.use("/images", genImageRoutes);
app.use("/setup", setupRoute);
app.use("/dashboard", dashboardRoute);
app.use("/users", userProfileRoute);
app.use('/games', gameRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
