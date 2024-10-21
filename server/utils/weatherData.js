import axios from "axios";
import { WeatherModel } from "../models/WeatherModel.js";

const openWeatherMap = {
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather?q=",
  SECRET_KEY: process.env.API_KEY,
};

const cities = ["Delhi", "Mumbai", "Chennai", "Bangalore", "Kolkata", "Hyderabad"];
const interval = process.env.POLL_INTERVAL || 300000; // Default 5 minutes

export function fetchWeatherData() {
  setInterval(async () => {
    for (const city of cities) {
      try {
        const response = await axios.get(`${openWeatherMap.BASE_URL}${encodeURIComponent(city)}&appid=${openWeatherMap.SECRET_KEY}`);
        const data = response.data;

        const tempCelsius = data.main.temp - 273.15;
        const feelsLikeCelsius = data.main.feels_like - 273.15;

        // Store data in MongoDB
        const weather = new WeatherModel({
          city,
          temp: tempCelsius,
          feels_like: feelsLikeCelsius,
          description: data.weather[0].description,
          timestamp: new Date(data.dt * 1000),
        });

        await weather.save();
        console.log(`Weather data for ${city} saved.`);
      } catch (error) {
        console.error(`Failed to fetch or save data for ${city}:`, error.response?.data || error.message);
      }
    }
  }, interval);
}
