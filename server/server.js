import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import router from "./routes/route.js";
import { fetchWeatherData } from "./utils/weatherData.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors(
  {
    origin: "http://localhost:5173"
  }
));
app.use("/", router);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      fetchWeatherData(); // Start the weather data retrieval process
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
