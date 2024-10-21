import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema({
  city: String,
  temp: Number,
  feels_like: Number,
  description: String,
  timestamp: Date,
});

export const WeatherModel = mongoose.model("Weather", weatherSchema);