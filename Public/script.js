// Store all airport data after loading airports.json
let airports = [];

// Store airline data after loading airlines.json
let airlines = [];

// Store the selected airport codes separately from what the user types
let selectedOriginCode = "";
let selectedDestinationCode = "";

// Get important elements from the page
const flightForm = document.getElementById("flight-form");
const originInput = document.getElementById("origin");
const destinationInput = document.getElementById("destination");
const resultsContainer = document.getElementById("results");

// Create suggestion boxes for the origin and destination inputs
const originSuggestions = document.createElement("div");
originSuggestions.id = "origin-suggestions";
originSuggestions.className = "suggestions-box";

const destinationSuggestions = document.createElement("div");
destinationSuggestions.id = "destination-suggestions";
destinationSuggestions.className = "suggestions-box";

// Insert the suggestion boxes right after each input
originInput.insertAdjacentElement("afterend", originSuggestions);
destinationInput.insertAdjacentElement("afterend", destinationSuggestions);

// Load airport data from airports.json
async function loadAirports() {
    try {
        const response = await fetch("airports.json");
        airports = await response.json();
        console.log("Airports loaded successfully.");
    } catch (error) {
        console.error("Error loading airports:", error);
    }
}

// Load airline data from airlines.json
async function loadAirlines() {
    try {
        const response = await fetch("airlines.json");
        airlines = await response.json();
        console.log("Airlines loaded successfully.");
    } catch (error) {
        console.error("Error loading airlines:", error);
    }
}

// Find matching airports based on code, city, country, or airport name
function searchAirports(query) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return airports
        .filter(airport =>
            airport.code.toLowerCase().includes(normalizedQuery) ||
            airport.city.toLowerCase().includes(normalizedQuery) ||
            airport.name.toLowerCase().includes(normalizedQuery) ||
            airport.country.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 8); // Limit suggestions so the list stays clean
}

// Show autocomplete suggestions for a given input
function showSuggestions(matches, suggestionsBox, inputElement, isOrigin) {
    suggestionsBox.innerHTML = "";

    if (matches.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    matches.forEach(airport => {
        const suggestionItem = document.createElement("div");
        suggestionItem.className = "suggestion-item";
        suggestionItem.textContent = `${airport.city}, ${airport.country} - ${airport.name} (${airport.code})`;

        // When the user clicks a suggestion, show the full airport name
        // but store only the airport code for the API request
        suggestionItem.addEventListener("click", () => {
            inputElement.value = `${airport.city} - ${airport.name} (${airport.code})`;

            if (isOrigin) {
                selectedOriginCode = airport.code;
            } else {
                selectedDestinationCode = airport.code;
            }

            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
        });

        suggestionsBox.appendChild(suggestionItem);
    });

    suggestionsBox.style.display = "block";
}

// If the user starts typing again after selecting an airport,
// clear the stored code until they select a valid suggestion again
originInput.addEventListener("input", () => {
    selectedOriginCode = "";

    const matches = searchAirports(originInput.value);
    showSuggestions(matches, originSuggestions, originInput, true);
});

destinationInput.addEventListener("input", () => {
    selectedDestinationCode = "";

    const matches = searchAirports(destinationInput.value);
    showSuggestions(matches, destinationSuggestions, destinationInput, false);
});

// Hide suggestions if the user clicks elsewhere on the page
document.addEventListener("click", (event) => {
    if (!originInput.contains(event.target) && !originSuggestions.contains(event.target)) {
        originSuggestions.style.display = "none";
    }

    if (!destinationInput.contains(event.target) && !destinationSuggestions.contains(event.target)) {
        destinationSuggestions.style.display = "none";
    }
});

// Get a readable airport name from the airport code
function getAirportDisplayName(code) {
    const airport = airports.find(a => a.code === code);

    if (airport) {
        return `${airport.city} - ${airport.name} (${airport.code})`;
    }

    return code;
}

// Get a readable airline name from the airline code
function getAirlineDisplayName(code) {
    const airline = airlines.find(a => a.code === code);

    if (airline) {
        return `${airline.name} (${airline.code})`;
    }

    return code;
}

// Handle form submission
flightForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const date = document.getElementById("date").value;

    // Make sure the user selected valid airports from the suggestions
    if (!selectedOriginCode || !selectedDestinationCode) {
        resultsContainer.innerHTML = "<p>Please select both airports from the suggestions.</p>";
        return;
    }

    resultsContainer.innerHTML = "<p>Searching for flights...</p>";

    try {
        const response = await fetch(
            `/flights?origin=${selectedOriginCode}&destination=${selectedDestinationCode}&date=${date}`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            resultsContainer.innerHTML = "";

            data.data.forEach((flight, index) => {
                const { itineraries, price, validatingAirlineCodes } = flight;

                // Get the airline code from the API
                const airlineCode = validatingAirlineCodes ? validatingAirlineCodes[0] : "N/A";

                // Convert it into something readable like "Air Canada (AC)"
                const airlineDisplay = getAirlineDisplayName(airlineCode);

                let flightDetails = `
                    <div class="flight-result">
                        <h3>Flight ${index + 1}</h3>
                        <p><strong>Price:</strong> ${price.total} ${price.currency}</p>
                        <p><strong>Airline:</strong> ${airlineDisplay}</p>
                        <h4>Flight Segments:</h4>
                `;

                itineraries[0].segments.forEach(segment => {
                    const departure = segment.departure;
                    const arrival = segment.arrival;

                    const departureName = getAirportDisplayName(departure.iataCode);
                    const arrivalName = getAirportDisplayName(arrival.iataCode);

                    flightDetails += `
                        <p>
                            <strong>From:</strong> ${departureName} - ${new Date(departure.at).toLocaleDateString()} at ${new Date(departure.at).toLocaleTimeString()}<br>
                            <strong>To:</strong> ${arrivalName} - ${new Date(arrival.at).toLocaleDateString()} at ${new Date(arrival.at).toLocaleTimeString()}
                        </p>
                    `;
                });

                flightDetails += `
                    </div>
                    <hr>
                `;

                resultsContainer.innerHTML += flightDetails;
            });
        } else {
            resultsContainer.innerHTML = "<p>No flights found. Try different dates or locations.</p>";
        }
    } catch (error) {
        console.error("Error fetching flights:", error);
        resultsContainer.innerHTML = "<p>Error fetching flights. Please try again later.</p>";
    }
});

// Load airport and airline data as soon as the page starts
loadAirports();
loadAirlines();