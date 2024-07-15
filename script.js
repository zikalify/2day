document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trackerForm");
    const logList = document.getElementById("logList");
    const container = document.querySelector(".container");
    const message = document.createElement("div");
    message.id = "message";
    message.style.fontWeight = "bold";

    // Insert message after h1 element
    const h1 = document.querySelector("h1");
    h1.insertAdjacentElement('afterend', message);

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const date = document.getElementById("date").value;
        const mucus = document.getElementById("mucus").value;
        
        if (date && mucus) {
            saveObservation(date, mucus);
            displayLog();
            checkFertilityStatus();
        }
    });

    function saveObservation(date, mucus) {
        let observations = JSON.parse(localStorage.getItem("observations")) || [];
        // Check if there's an existing observation for the same date
        const existingIndex = observations.findIndex(obs => obs.date === date);
        if (existingIndex !== -1) {
            // Replace existing observation
            observations[existingIndex] = { date, mucus };
        } else {
            // Add new observation
            observations.push({ date, mucus });
        }
        // Sort observations by date in descending order (latest date first)
        observations.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem("observations", JSON.stringify(observations));
    }

    function deleteObservation(index) {
        let observations = JSON.parse(localStorage.getItem("observations")) || [];
        observations.splice(index, 1);
        localStorage.setItem("observations", JSON.stringify(observations));
        displayLog();
        checkFertilityStatus();
    }

    function displayLog() {
        const observations = JSON.parse(localStorage.getItem("observations")) || [];
        // Sort observations by date in descending order (latest date first)
        observations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Show "Enter data to track fertility" message if no observations
        if (observations.length === 0) {
            logList.innerHTML = "";
            message.innerText = "Enter data to track fertility";
            return;
        }
        
        // Clear the message if there are observations
        message.innerText = "";

        logList.innerHTML = observations.map((obs, index) => 
            `<li>${obs.date}: ${obs.mucus} <button onclick="deleteObservation(${index})">Delete</button></li>`
        ).join('');
    }

    function checkFertilityStatus() {
        const observations = JSON.parse(localStorage.getItem("observations")) || [];
        if (observations.length === 0) {
            document.body.style.backgroundColor = "#f4f4f4"; // Neutral background color
            message.innerText = "Enter data to track fertility"; // Display message to enter data
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if all observations are for dates before yesterday
        const allBeforeYesterday = observations.every(obs => obs.date < yesterday);

        if (allBeforeYesterday) {
            document.body.style.backgroundColor = "#f4f4f4"; // Neutral background color
            message.innerText = "Enter more recent data to track fertility";
        } else {
            // Check if either today or yesterday has "yes" for mucus
            const todayObservation = observations.find(obs => obs.date === today);
            const yesterdayObservation = observations.find(obs => obs.date === yesterday);

            if ((todayObservation && todayObservation.mucus === "yes") || (yesterdayObservation && yesterdayObservation.mucus === "yes")) {
                document.body.style.backgroundColor = "#ffcccc"; // Light red for possible pregnancy
                message.innerText = "Pregnancy is possible";
            } else {
                document.body.style.backgroundColor = "#ccffcc"; // Light green for not possible pregnancy
                message.innerText = "Pregnancy is not possible";
            }
        }
    }

    displayLog();
    checkFertilityStatus(); // Check status on page load

    // Adding deleteObservation function to the global scope so it can be called from the HTML
    window.deleteObservation = deleteObservation;
});

