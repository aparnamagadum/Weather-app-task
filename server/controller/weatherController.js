import { WeatherModel } from "../models/WeatherModel.js";
import { AlertModel } from "../models/AlertModel.js";
export async function getData(req, res) {
  const { city } = req.query;
  if (!city) {
    return res.status(400).send("City is required");
  }
  const allowedCities = ["Delhi", "Mumbai", "Chennai", "Bangalore", "Kolkata", "Hyderabad"];
  // Check if the requested city is in the allowed list
  if (!allowedCities.includes(city)) {
    return res.status(400).send("City not supported.");
  }

  try {
    const weatherData = await WeatherModel.findOne({ city }).sort({ timestamp: -1 }); // Get the most recent weather data for the city

    if (!weatherData) {
      return res.status(404).send("Weather data not found for the city");
    }

    res.status(200).send(weatherData); // Send the most recent weather data
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error);
    res.status(500).send("Error fetching weather data");
  }
}

// Function to get daily summary for a specific city
export async function getDailySummary(req, res) {
  const { city } = req.query;
  if (!city) {
    return res.status(400).send("City is required");
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const summaries = await WeatherModel.aggregate([
      {
        $match: {
          city,
          timestamp: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: "$city",
          avgTemp: { $avg: "$temp" },
          maxTemp: { $max: "$temp" },
          minTemp: { $min: "$temp" },
          dominantCondition: { $first: "$description" },
        },
      },
    ]);

    if (summaries.length === 0) {
      return res.status(404).send("No summary data found for the city today");
    }

    res.status(200).send(summaries);
  } catch (error) {
    console.error(`Error fetching daily summary for ${city}:`, error);
    res.status(500).send("Error fetching daily summary");
  }
}
// Create a new alert
export async function createAlert(req, res) {
  const { city, tempThreshold, condition, currentTemperature } = req.body;

  if (!city || tempThreshold == null) {
    return res.status(400).send("City and temperature threshold are required");
  }

  const isTriggered =
    (condition === 'greater' && currentTemperature > tempThreshold) |
    (condition === 'less' && currentTemperature < tempThreshold);

  try {
    const alert = new AlertModel({
      city,
      tempThreshold,
      condition,
      isTriggered,
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).send("Error creating alert");
  }
}
export async function getAlert(req, res){
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const alerts = await AlertModel.find({ city: city });
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};