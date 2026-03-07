# Cheap Flight Finder ✈️

Live Demo: https://cheap-flight-finder-zlj0.onrender.com

Cheap Flight Finder is a full-stack web application that allows users to search for flight options between airports worldwide. The application uses the **Amadeus Flight Offers API** to retrieve real flight data and displays flight prices, airlines, and segment details.

The project demonstrates building a complete web app using **Node.js, Express, and a JavaScript frontend**, while integrating a real third-party aviation API.

Please note: This project uses the Amadeus Sandbox API, meaning flight results are simulated and not guaranteed to reflect real-time airline availability.
---

# Features

### Flight Search

Users can search flights by selecting:

* Origin airport
* Destination airport
* Departure date

The system returns:

* Flight price
* Airline
* Flight segments
* Departure and arrival airports
* Departure and arrival times

---

### Airport Autocomplete

The search fields include an **autocomplete system** that allows users to find airports by:

* Airport code
* Airport name
* City
* Country

This is powered by a local dataset of global airports.

---

### Airline Code Resolution

Flight APIs return airline codes (for example `AC`, `DL`, `UA`).
The application translates these into readable airline names using a local airline dataset.

Example:

```
AC → Air Canada
DL → Delta Air Lines
UA → United Airlines
```

The result displayed to the user is:

```
Airline: Air Canada (AC)
```

---

# Technologies Used

### Backend

* Node.js
* Express.js
* Axios
* dotenv

### Frontend

* HTML
* CSS
* Vanilla JavaScript

### External API

Amadeus Self-Service API

Endpoints used:

* OAuth Token Endpoint
* Flight Offers Search

---

# API Integration

The application uses the **Amadeus Flight Offers API**.

API documentation:
https://developers.amadeus.com

## Authentication

The backend requests an OAuth access token using:

```
POST /v1/security/oauth2/token
```

with:

```
grant_type=client_credentials
client_id=AMADEUS_API_KEY
client_secret=AMADEUS_API_SECRET
```

The returned token is then used to authenticate flight search requests.

---

## Flight Search Endpoint

The backend calls:

```
GET /v2/shopping/flight-offers
```

Parameters:

* originLocationCode
* destinationLocationCode
* departureDate
* adults

Example request:

```
/flights?origin=YYZ&destination=JFK&date=2026-06-18
```

Example response includes:

* price
* airline codes
* itinerary segments
* departure and arrival times

---

# Project Structure

```
cheap-flight-finder
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
│
├── Public
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── airports.json
│   └── airlines.json
│
└── README.md
```

---

# Deployment

The application is deployed on **Render**.

Render pulls the source code from GitHub and automatically builds and deploys the Node.js application.

Deployment steps:

1. Push repository to GitHub
2. Create a Web Service on Render
3. Connect the GitHub repository
4. Configure environment variables
5. Deploy

Build command:

```
npm install
```

Start command:

```
node server.js
```

---

# Environment Variables

The backend requires the following environment variables:

```
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
```

These should be stored in a `.env` file locally and configured in the Render dashboard for production.

---

# Running Locally

Clone the repository:

```
git clone https://github.com/yourusername/cheap-flight-finder.git
```

Install dependencies:

```
npm install
```

Create a `.env` file:

```
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
```

Start the server:

```
node server.js
```

Open in browser:

```
http://localhost:5001
```

---

# Limitations

* Uses the **Amadeus test environment**
* Results may not reflect real-time airline inventory
* Free hosting may cause the server to sleep after inactivity

---

# Future Improvements

Possible improvements include:

* airline logos
* return flights
* passenger selection
* price filtering
* pagination for search results
* caching API responses
* production Amadeus API access

---

# License

This project is intended for educational and demonstration purposes.
