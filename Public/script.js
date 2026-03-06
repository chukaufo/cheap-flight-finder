document.getElementById("flight-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const origin = document.getElementById("origin").value.toUpperCase();
    const destination = document.getElementById("destination").value.toUpperCase();
    const date = document.getElementById("date").value;

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "<p>Searching for flights...</p>";

    try {
        const response = await fetch(`/flights?origin=${origin}&destination=${destination}&date=${date}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            resultsContainer.innerHTML = "";

            data.data.forEach((flight, index) => {
                const { itineraries, price, validatingAirlineCodes } = flight;
                const airline = validatingAirlineCodes ? validatingAirlineCodes[0] : "N/A";

                let flightDetails = `
                    <div class="flight-result">
                        <h3>Flight ${index + 1}</h3>
                        <p><strong>Price:</strong> ${price.total} ${price.currency}</p>
                        <p><strong>Airline:</strong> ${airline}</p>
                        <h4>Flight Segments:</h4>
                `;

                itineraries[0].segments.forEach(segment => {
                    const departure = segment.departure;
                    const arrival = segment.arrival;

                    flightDetails += `
                        <p>
                            <strong>From:</strong> ${departure.iataCode} - ${new Date(departure.at).toLocaleDateString()} at ${new Date(departure.at).toLocaleTimeString()}<br>
                            <strong>To:</strong> ${arrival.iataCode} - ${new Date(arrival.at).toLocaleDateString()} at ${new Date(arrival.at).toLocaleTimeString()}
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