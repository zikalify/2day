document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trackerForm");
    const logList = document.getElementById("logList");
    const container = document.querySelector(".container");
    const message = document.createElement("div");
    message.id = "message";
    message.style.fontWeight = "bold";
    container.insertBefore(message, container.firstChild); // Insert message as the first child of container

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
        observations.push({ date, mucus });
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
        logList.innerHTML = observations.map((obs, index) => 
            `<li>${obs.date}: ${obs.mucus} <button onclick="deleteObservation(${index})">Delete</button></li>`
        ).join('');
    }

    function checkFertilityStatus() {
        const observations = JSON.parse(localStorage.getItem("observations")) || [];
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const todayObservation = observations.find(obs => obs.date === today);
        const yesterdayObservation = observations.find(obs => obs.date === yesterday);

        if (!todayObservation || !yesterdayObservation || (todayObservation && todayObservation.mucus === "yes") || (yesterdayObservation && yesterdayObservation.mucus === "yes")) {
            document.body.style.backgroundColor = "#ffcccc"; // Light red for possible pregnancy
            message.innerText = "Pregnancy is possible";
        } else {
            document.body.style.backgroundColor = "#ccffcc"; // Light green for not possible pregnancy
            message.innerText = "Pregnancy is not possible";
        }
    }

    displayLog();
    checkFertilityStatus(); // Check status on page load

    // Adding deleteObservation function to the global scope so it can be called from the HTML
    window.deleteObservation = deleteObservation;
});

