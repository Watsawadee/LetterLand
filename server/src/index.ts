import dotenv from "dotenv";
import express from "express";
import path from "path";
import userRoutes from "./routes/userRoutes";
import pronunciationRoutes from "./routes/pronunciationRoutes";
import geminiRoutes from "./routes/createGameRoutes";
import genImageRoutes from "./routes/genImageRoutes";
import setupRoute from "./routes/setupRoutes";
import cors from "cors";
import dashboardRoute from "./routes/dashboardRoute";
import userProfileRoute from "./routes/userProfileRoute"
import gameRoutes from './routes/gameRoutes';
import mygameRoutes from './routes/mygameRoute';
import publicgameRoutes from './routes/publicgameRoute';
import wordBankRoutes from './routes/wordbankRoute'
import settingRoutes from './routes/settingRoutes'
import achievementRoutes from "./routes/achievementRoute";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.use("/users", userRoutes);
app.use("/pronunciations", pronunciationRoutes);
app.use("/geminis", geminiRoutes);
app.use("/images", genImageRoutes);
app.use("/setup", setupRoute);
app.use("/dashboard", dashboardRoute);
app.use("/users", userProfileRoute);
app.use('/games', gameRoutes);
app.use('/mygame', mygameRoutes);
app.use("/publicgame", publicgameRoutes);
app.use("/wordbank", wordBankRoutes);
app.use("/setting", settingRoutes)
app.use("/achievement", achievementRoutes);


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
