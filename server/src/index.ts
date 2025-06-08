import express from "express";
import path from "path";
import userRoutes from "./routes/userRoutes";
import pronunciationRoutes from "./routes/pronunciationRoutes";
import geminiRoutes from "./routes/geminiRoutes";
import genImageRoutes from "./routes/genImageRoutes";
import setupRoute from "./routes/setupRoutes";
import getCEFRDefaultRoute from "./routes/cefrRoute";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.use("/api/users", userRoutes);
app.use("/api/pronunciations", pronunciationRoutes);
app.use("/api/geminis", geminiRoutes);
app.use("/api/images", genImageRoutes);
app.use("/api", setupRoute);
app.use("/api/users", getCEFRDefaultRoute);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
