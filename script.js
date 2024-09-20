const results = [];

function calculate() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const sex = document.getElementById('sex').value;
    const activityFactor = parseFloat(document.getElementById('activity').value);
    const hb = parseFloat(document.getElementById('hb').value);
    const spo2 = parseFloat(document.getElementById('spo2').value) / 100; // Convert to decimal
    const sv02 = parseFloat(document.getElementById('sv02').value) / 100; // Convert to decimal
    const HR = parseInt(document.getElementById('hr').value);
    const SV = parseFloat(document.getElementById('sv').value);

    const TDEE = calculateTDEE(weight, height, age, sex, activityFactor);
    const VO2 = convertTDEDtoVO2(TDEE);
    const O2Requirement = calculateO2Requirement(HR, SV, hb, spo2, sv02);

    // Display results
    document.getElementById('result').innerHTML = `
        <strong>O₂ Requirement during Activity:</strong> ${O2Requirement.toFixed(2)} mL/min<br>
        <strong>Estimated O₂ Requirement:</strong> ${VO2.toFixed(2)} L/min
    `;

    // Update the results table
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.insertCell(0).innerText = HR;
    newRow.insertCell(1).innerText = (spo2 * 100).toFixed(2); // Convert back to percentage
    newRow.insertCell(2).innerText = O2Requirement.toFixed(2);

    // Save result for downloading
    results.push({ HR, SpO2: (spo2 * 100).toFixed(2), O2Requirement: O2Requirement.toFixed(2) });
}

function calculateTDEE(weight, height, age, sex, activityFactor) {
    let BMR;
    if (sex === 'male') {
        BMR = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        BMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    return BMR * activityFactor; // Total Daily Energy Expenditure
}

function convertTDEDtoVO2(TDEE) {
    return TDEE / (1440 * 5); // Convert kcal/day to L/min
}

function calculateO2Requirement(HR, SV, hb, spo2, sv02) {
    const CaO2 = (1.34 * hb * spo2) + (0.003 * 100); // Assuming PaO2 = 100 mmHg
    const CvO2 = (1.34 * hb * sv02) + (0.003 * 40); // Assuming PvO2 = 40 mmHg
    return HR * SV * (CaO2 - CvO2); // in mL/min
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8," 
        + "Heart Rate (bpm),SpO₂ (%),O₂ Requirement (mL/min)\n"
        + results.map(e => `${e.HR},${e.SpO2},${e.O2Requirement}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "oxygen_requirements.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveToExcel() {
    let table = document.getElementById('resultsTable');
    let excel = "<table>";
    
    for (let row of table.rows) {
        excel += "<tr>";
        for (let cell of row.cells) {
            excel += `<td>${cell.innerText}</td>`;
        }
        excel += "</tr>";
    }
    excel += "</table>";

    const blob = new Blob([excel], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oxygen_requirements.xls"; // Filename for the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function openModal() {
    document.getElementById('myModal').style.display = "block";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

