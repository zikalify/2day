document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trackerForm");
    const logList = document.getElementById("logList");
    const container = document.querySelector(".container");
    const message = document.getElementById("message");
    const twoDayInfoBtn = document.getElementById("twoDayInfoBtn");
    const twoDayExplainer = document.getElementById("twoDayExplainer");

    twoDayInfoBtn.addEventListener("click", function() {
        if (twoDayExplainer.style.display === "none") {
            twoDayExplainer.style.display = "block";
            twoDayInfoBtn.textContent = "Hide TwoDay Method Info";
        } else {
            twoDayExplainer.style.display = "none";
            twoDayInfoBtn.textContent = "What is the TwoDay Method?";
        }
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const date = formatDate(document.getElementById("date").value);
        const mucus = document.getElementById("mucus").value;
        
        if (date && mucus) {
            saveObservation(date, mucus);
            displayLog();
            checkFertilityStatus();
        }
    });

    function saveObservation(date, mucus) {
        let observations = JSON.parse(localStorage.getItem("observations")) || [];
        const existingIndex = observations.findIndex(obs => obs.date === date);
        if (existingIndex !== -1) {
            observations[existingIndex] = { date, mucus };
        } else {
            observations.push({ date, mucus });
        }
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
        observations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (observations.length === 0) {
            logList.innerHTML = "";
            message.innerText = "Enter data to track fertility";
            return;
        }
        
        message.innerText = "";

        logList.innerHTML = observations.map((obs, index) => {
            const formattedDate = formatDisplayDate(obs.date);
            return `<li>${formattedDate}: ${obs.mucus} <button onclick="deleteObservation(${index})">Delete</button></li>`;
        }).join('');
    }

    function checkFertilityStatus() {
        const observations = JSON.parse(localStorage.getItem("observations")) || [];
        if (observations.length === 0) {
            document.body.style.backgroundColor = "#f4f4f4";
            message.innerText = "Enter data to track fertility";
            return;
        }

        const today = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

        const todayObservation = observations.find(obs => obs.date === today);
        const yesterdayObservation = observations.find(obs => obs.date === yesterday);

        const todayHasMucus = todayObservation && todayObservation.mucus === "yes";
        const yesterdayHasMucus = yesterdayObservation && yesterdayObservation.mucus === "yes";
        const todayMissing = !todayObservation;
        const yesterdayMissing = !yesterdayObservation;

        if (todayHasMucus || yesterdayHasMucus || todayMissing || yesterdayMissing) {
            document.body.style.backgroundColor = "#ffcccc";
            message.innerText = "Pregnancy is possible today";
        } else {
            document.body.style.backgroundColor = "#ccffcc";
            message.innerText = "Pregnancy is unlikely today";
        }
    }

    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA');
    }

    displayLog();
    checkFertilityStatus();

    window.deleteObservation = deleteObservation;
});
