import React, { useState } from "react";
import { FaCloud } from "react-icons/fa";
import "./Weather.css"
function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [dailySummary, setDailySummary] = useState([]);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false); 
  const [showAlertForm, setShowAlertForm] = useState(false); 
  const [alertData, setAlertData] = useState({
    tempThreshold: "",
    condition: "greater",
  });
  const [alerts, setAlerts] = useState([]);

  const fetchWeather = async (e) => {
    e.preventDefault();
    setError("");
    setWeather(null);
    setDailySummary([]);
    setShowSummary(false);
    setShowAlertForm(false);

    try {
      const response = await fetch(`https://weather-app-task-84mg.onrender.com/weather?city=${city}`);
      if (!response.ok) {
        setError("City not found");
        return;
      }
      const weatherData = await response.json();
      setWeather(weatherData);
    } catch (error) {
      setError("Error fetching weather data");
    }
  };

  const fetchDailySummary = async (searchedCity) => {
    try {
      const response = await fetch(`https://weather-app-task-84mg.onrender.com/summaries?city=${searchedCity}`);
      if (!response.ok) {
        setError("Failed to fetch daily summary");
        return;
      }
      const summaryData = await response.json();
      setDailySummary(summaryData);
      setShowSummary(true);
      setError(""); // Clear any previous errors
    } catch (error) {
      setError("Error fetching daily summary");
    }
  };

  const handleShowSummary = () => {
    if (weather && weather.city) {
      fetchDailySummary(weather.city);
    } else {
      setError("Please fetch weather data for a city first.");
    }
  };

  const handleAlertChange = (e) => {
    const { name, value } = e.target;
    setAlertData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createAlert = async () => {
    if (!weather) {
      setError("Please fetch the weather data first");
      return;
    }

    try {
      const response = await fetch(`https://weather-app-task-84mg.onrender.com/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          tempThreshold: parseFloat(alertData.tempThreshold),
          condition: alertData.condition,
          currentTemperature: weather.temp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create alert");
      }
      const alert = await response.json();
      console.log("Alert created:", alert);
      setAlertData({ tempThreshold: "", condition: "greater" });
      setShowAlertForm(false);
      fetchAlertsForCity(city);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAlertsForCity = async (searchedCity) => {
    try {
      const response = await fetch(`https://weather-app-task-84mg.onrender.com/alerts?city=${searchedCity}`);
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const alertsData = await response.json();
      setAlerts(alertsData);
    } catch (error) {
      setError("Error fetching alerts");
    }
  };

  return (
    <div className="weather-widget">
      <form onSubmit={fetchWeather}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p>{error}</p>}

      {weather && (
        <div className="data">
          <div className="temp">
            <FaCloud style={{ fontSize: "xx-large" }} />
            <div>
              <h1>{weather.temp.toFixed(2)}°C</h1>
              <span>{weather.description}</span>
            </div>
          </div>
          <h2>{weather.city}</h2>
          <h3>{new Date(weather.timestamp).toLocaleString()}</h3>
          <h3>Feels Like: {weather.feels_like.toFixed(2)}°C</h3>

          <button onClick={handleShowSummary} style={{ marginBottom: "20px" }}>
            Show Daily Summary
          </button>
        </div>
      )}

      {showSummary && dailySummary.length > 0 && (
        <ul>
          {dailySummary.map((summary) => (
            <li key={summary._id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p>Average Temperature: {summary.avgTemp.toFixed(2)}°C</p>
              <p>Max Temperature: {summary.maxTemp.toFixed(2)}°C</p>
              <p>Min Temperature: {summary.minTemp.toFixed(2)}°C</p>
              <p>Dominant Condition: {summary.dominantCondition}</p>
            </li>
          ))}
        </ul>
      )}

      {weather && (
        <div className="alert-creation">
          <button onClick={() => setShowAlertForm(!showAlertForm)}>
            {showAlertForm ? "Cancel" : "Create Alert"}
          </button>
          {showAlertForm && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <input
                type="number"
                name="tempThreshold"
                placeholder="Temperature Threshold"
                value={alertData.tempThreshold}
                onChange={handleAlertChange}
                style={{ flex: "1" }}
              />
              <select
                name="condition"
                value={alertData.condition}
                onChange={handleAlertChange}
                style={{ padding: "5px", borderRadius: "5px" }}
              >
                <option value="greater">Greater than</option>
                <option value="less">Less than</option>
              </select>
              <button onClick={createAlert}>Add</button>
            </div>
          )}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="alerts">
          <h3>Alerts for {city}</h3>
          <ul>
            {alerts.map((alert) => (
              <li key={alert._id}>
                {alert.city}: {alert.isTriggered ? "Triggered" : "Not Triggered"} - {alert.tempThreshold}°C
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Weather;
