// Import required modules
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables from .env
dotenv.config();

// Create an Express app
const app = express();
const PORT = process.env.PORT || 5001;  // Use another available port
app.use(express.json());

app.use(express.static("public"));


app.get("/", (req, res) => {
  res.send("Welcome to the Flight Ticket Finder API!");
});

// Defines the flight search endpoint
app.get("/flights", async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      })
    );

    const token = response.data.access_token;

    const flightsResponse = await axios.get(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults: "1",
        },
      }
    );

    res.json(flightsResponse.data);
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// Confirm Flight Price Route
app.post("/confirm-price", async (req, res) => {
  try {
    const flightOffer = req.body.data[0]; // Extract the flight offer

    // Ensure correct payload format
    const pricingPayload = {
      data: {
        type: "flight-offers-pricing",
        flightOffers: [flightOffer],
      },
    };

    // Get access token
    const tokenResponse = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      })
    );

    const token = tokenResponse.data.access_token;

    // Confirm price
    const priceResponse = await axios.post(
      "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing",
      pricingPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(priceResponse.data); // Return confirmed price
  } catch (error) {
    console.error("Error confirming flight price:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to confirm flight price",
      details: error.response?.data || error.message,
    });
  }
});



app.post("/create-order", async (req, res) => {
  try {
    const orderData = req.body;

    const tokenResponse = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      })
    );

    const token = tokenResponse.data.access_token;

    const orderResponse = await axios.post(
      "https://test.api.amadeus.com/v1/booking/flight-orders",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(orderResponse.data);
  } catch (error) {
    console.error("Error creating flight order:", error.message);
    res.status(500).json({ error: "Failed to create flight order" });
  }
});



// Starts the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
