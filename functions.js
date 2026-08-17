// --- Core Application Logic & Lookup Tables ---
const tableTakeoffFLKeys = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
const tableTakeoffOATKeys = [-25, -24, -22, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 49];
const tableFLKeys =  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340];
const tableOATKeys = [-54, -52, -50, -48, -46, -44, -42, -40, -38, -36, -34, -32, -30, -28, -26, -24, -22, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 49];
const tableTakeoffPower = [];
const tableClimbPower = [];
const tableMaxCruisePower = [];
const tableNormCruisePower = [];
const tableEconCruisePower = [];

let tableTOPerfTOGR = new Map();
let tableTOPerfTOD50 = new Map();
let tableTOPerfUPGR = new Map();
let tableTOPerfUPD50 = new Map();
let tableROC = new Map();
let tableTimeToClimb = new Map();
let tableFuelToClimb = new Map();
let tableDistanceToClimb = new Map();
let tableMaxCruisePerformance = new Map();
let tableNormalCruisePerformance = new Map();
let tableEconomyCruisePerformance = new Map();
let tableLandPerfTOGR = new Map();
let tableLandPerfTOD50 = new Map();
let tableLandPerfFULLGR = new Map();
let tableLandPerfFULLD50 = new Map();

let cruiseSetting = { 'TQ': 0, 'FF': 1, 'IAS': 2, 'TAS': 3 };

let startAlt = 0;
let startOAT = parseFloat(getISAatALT(startAlt));
let endAlt = 34000;
let endOAT = parseFloat(getISAatALT(endAlt));

window.onload = function () {
    populateWeightPickers();
    populateAirfieldAltPickers();
    populateAltitudePickers();
    populateOATPickers();
    populateAirfieldOATPickers();
    populateRPMPickers();
    populateHeadingPickers();
    populateSpeedPickers();
    populateSlopePickers();
    buildTakeoffPowerTables(tableTakeoffPower);
    buildClimbPowerTables(tableClimbPower)
    buildCruisePowerTables(tableMaxCruisePower, tableNormCruisePower, tableEconCruisePower);

    buildTakeoffPerformanceTables(tableTOPerfTOGR, tableTOPerfTOD50, tableTOPerfUPGR, tableTOPerfUPD50);
    buildRateOfClimbTables(tableROC);
    buildTimeFuelDistanceTables(tableTimeToClimb, tableFuelToClimb, tableDistanceToClimb);
    buildMaxCruisePerformanceTables(tableMaxCruisePerformance);
    buildNormalCruisePerformanceTables(tableNormalCruisePerformance);
    buildEconomyCruisePerformanceTables(tableEconomyCruisePerformance);
    buildLandingPerformanceTables(tableLandPerfTOGR, tableLandPerfTOD50, tableLandPerfFULLGR, tableLandPerfFULLD50);

    // Run initial calculations silently (without showing the modal)
    // calculateTakeoff(false);
    // calculateClimb(false);
    // calculateCruise(false);
    // calculateLanding(false);
};

// --- Modal Popup Logic ---
function showModal(tabId) {
    let resultCard = document.querySelector(`#${tabId} .card:nth-child(2)`);
    let modalContent = document.getElementById("modal-content-area");

    // Clear previous modal content
    modalContent.innerHTML = "";

    // Clone the results card
    let clone = resultCard.cloneNode(true);

    // Strip IDs from the clone to prevent JS conflicts with the hidden originals
    let elementsWithIds = clone.querySelectorAll('[id]');
    elementsWithIds.forEach(el => el.removeAttribute('id'));

    // Adjust styles for modal display
    clone.style.display = "block";
    clone.style.border = "none";
    clone.style.padding = "0";

    modalContent.appendChild(clone);

    // Display the overlay
    document.getElementById("results-modal").style.display = "flex";
}

function closeModal(e) {
    if (e) e.stopPropagation();
    document.getElementById("results-modal").style.display = "none";
}

// --- Tab Navigation Logic ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    let btnId = tabId.replace('tab-', 'btn-');
    document.getElementById(btnId).classList.add('active');
}

function syncInput(field, val) {
    if (field === 'pwrAlt') {
        //set ISA (plus offset) based on selected altitude
        let isaOffset = parseFloat(convertToISA(endOAT, endAlt));
        let altISA = parseFloat(getISAatALT(val));
        let newOAT = altISA + isaOffset;

        document.getElementById("pwr-alt").value = val;
        document.getElementById("cl-endAlt").value = val;
        document.getElementById("cr-alt").value = val;

        //update all associated temps
        document.getElementById("pwr-oat").value = newOAT.toFixed(0);
        document.getElementById("cl-endOAT").value = newOAT.toFixed(0);
        document.getElementById("cr-oat").value = newOAT.toFixed(0);
        endAlt = val;
        endOAT = newOAT;
    } else if (field === 'pwrOAT') {
        document.getElementById("pwr-oat").value = val;
        document.getElementById("cl-endOAT").value = val;
        document.getElementById("cr-oat").value = val;
        endOAT = val;
    } else if (field === 'propRPM') {
        document.getElementById("pwr-rpm").value = val;
        document.getElementById("cr-rpm").value = val;
    } else if (field === 'weight') {
        document.getElementById("to-weight").value = val;
        document.getElementById("cl-weight").value = val;
        document.getElementById("ld-weight").value = val;
    } else if (field === 'startAlt') {
        //set ISA (plus offset) based on selected altitude
        let isaOffset = parseFloat(convertToISA(startOAT, startAlt));
        let altISA = parseFloat(getISAatALT(val));
        let newOAT = altISA + isaOffset;

        document.getElementById("to-alt").value = val;
        document.getElementById("cl-startAlt").value = val;
        document.getElementById("ld-alt").value = val;

        //update all associated temps
        document.getElementById("to-oat").value = newOAT.toFixed(0);
        document.getElementById("cl-startOAT").value = newOAT.toFixed(0);
        document.getElementById("ld-oat").value = newOAT.toFixed(0);
        startAlt = val;
        startOAT = newOAT;
    } else if (field === 'startOAT') {
        document.getElementById("to-oat").value = val;
        document.getElementById("cl-startOAT").value = val;
        document.getElementById("ld-oat").value = val;
        startOAT = val;
    } else if (field === 'endAlt') {
        //set ISA (plus offset) based on selected altitude
        let isaOffset = parseFloat(convertToISA(endOAT, endAlt));
        let altISA = parseFloat(getISAatALT(val));
        let newOAT = altISA + isaOffset;

        document.getElementById("pwr-alt").value = val;
        document.getElementById("cl-endAlt").value = val;
        document.getElementById("cr-alt").value = val;

        //update all associated temps
        document.getElementById("pwr-oat").value = newOAT.toFixed(0);
        document.getElementById("cl-endOAT").value = newOAT.toFixed(0);
        document.getElementById("cr-oat").value = newOAT.toFixed(0);
        endAlt = val;
        endOAT = newOAT;
    } else if (field === 'endOAT') {
        document.getElementById("pwr-oat").value = val;
        document.getElementById("cl-endOAT").value = val;
        document.getElementById("cr-oat").value = val;
        endOAT = val;
    } else if (field === 'windDir') {
        document.getElementById("to-windDir").value = val;
        document.getElementById("ld-windDir").value = val;
    } else if (field === 'windSpeed') {
        document.getElementById("to-windSpeed").value = val;
        document.getElementById("ld-windSpeed").value = val;
    } else if (field === 'course') {
        document.getElementById("to-course").value = val;
        document.getElementById("ld-course").value = val;
    } else if (field === 'slope') {
        document.getElementById("to-slope").value = val;
        document.getElementById("ld-slope").value = val;
    } else if (field === 'cond') {
        document.querySelector(`input[name="to-cond"][value="${val}"]`).checked = true;
        document.querySelector(`input[name="ld-cond"][value="${val}"]`).checked = true;
    }
}

function resetTab(tabId) {
    let tab = document.getElementById(tabId);
    let inputs = tab.querySelectorAll('input[type="number"], select');
    inputs.forEach(input => {
        input.value = "0";
        if (input.id.includes("weight")) {
            if (tabId === "tab-landing") {
                input.value = "7600";
                syncInput('weight', "7600");
            } else {
                input.value = "8000";
                syncInput('weight', "8000");
            }
        }
        if (input.id === "pwr-rpm" || input.id === "cr-rpm") {
            input.value = "1700";
            syncInput('propRPM', "1700");
        }
        if (input.id.includes("pwr-alt")) syncInput('pwrAlt', "0");
        if (input.id.includes("pwr-oat")) syncInput('pwrOAT', "0");
        if (input.id === "to-alt" || input.id === "cl-startAlt" || input.id === "ld-alt" ) syncInput('startAlt', "0");
        if (input.id === "to-oat" || input.id === "cl-startOAT" || input.id === "ld-oat" ) syncInput('startOAT', "0");
        if (input.id === "cl-endAlt" || input.id === "cr-alt") syncInput('endAlt', "0");
        if (input.id === "cl-endOAT" || input.id === "cr-oat") syncInput('endOAT', "0");
        if (input.id.includes("windDir")) syncInput('windDir', "0");
        if (input.id.includes("windSpeed")) syncInput('windSpeed', "0");
        if (input.id.includes("course")) syncInput('course', "0");
        if (input.id.includes("slope")) syncInput('slope', "0");
    });

    let pusherIceMode = document.getElementById('ld-ice');

    if (tabId === 'tab-climb' || tabId === 'tab-power') {
        let allOutputs = document.querySelectorAll('.metric-value');
        allOutputs.forEach(output => {
            output.innerText = "--";
        });

        let allTableCells = document.querySelectorAll('td[id^="res-"]');
        allTableCells.forEach(cell => {
            cell.innerText = "--";
        });
    } else if (tabId === 'tab-takeoff' || tabId === 'tab-landing') {
        let takeoffOutputs = document.getElementById('tab-takeoff').querySelectorAll('.metric-value');
        let climbOutputs = document.getElementById('tab-climb').querySelectorAll('.metric-value');
        let landingOutputs = document.getElementById('tab-landing').querySelectorAll('.metric-value');

        [...takeoffOutputs, ...climbOutputs, ...landingOutputs].forEach(output => {
            output.innerText = "--";
        });

        syncInput('cond', 'D');
        if (tabId === 'tab-landing') {
            pusherIceMode.checked = false;
        }
    }  else if (tabId === 'tab-cruise') {
        let climbOutputs = document.getElementById('tab-climb').querySelectorAll('.metric-value');
        let cruiseOutputs = document.getElementById('tab-cruise').querySelectorAll('.metric-value');

        [...climbOutputs, ...cruiseOutputs].forEach(output => {
            output.innerText = "--";
        });
    }

    let errorBanner = tab.querySelector('.alert-banner');
    if (errorBanner) {
        errorBanner.style.display = "none";
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

// Function to format numbers with commas
const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};

/**
 * 1D Linear Interpolation
 */
function interpolateLinear(x, x1, x2, y1, y2) {
    if (x1 === x2) return y1; // Avoid division by zero if bounds are identical
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

/**
 * Bilinear Interpolation for a 2D Table
 *
 * @param {number} targetRow - The target Y-Axis value (e.g., OAT)
 * @param {number} targetCol - The target X-Axis value (e.g., Flight Level)
 * @param {Array<number>} rowKeys - Array of Y-Axis headers
 * @param {Array<number>} colKeys - Array of X-Axis headers
 * @param {Array<Array<number>>} dataMatrix - 2D array of the table values
 */
function getBilinearInterpolation(targetRow, targetCol, rowKeys, colKeys, dataMatrix) {
    // 1. Find bounding row keys (Temperature)
    let r1 = rowKeys[0], r2 = rowKeys[rowKeys.length - 1];
    let r1Index = 0, r2Index = rowKeys.length - 1;

    for (let i = 0; i < rowKeys.length - 1; i++) {
        if (targetRow >= rowKeys[i] && targetRow <= rowKeys[i+1]) {
            r1 = rowKeys[i];
            r2 = rowKeys[i+1];
            r1Index = i;
            r2Index = i+1;
            break;
        }
    }

    // 2. Find bounding column keys (Altitude)
    let c1 = colKeys[0], c2 = colKeys[colKeys.length - 1];
    let c1Index = 0, c2Index = colKeys.length - 1;

    for (let i = 0; i < colKeys.length - 1; i++) {
        if (targetCol >= colKeys[i] && targetCol <= colKeys[i+1]) {
            c1 = colKeys[i];
            c2 = colKeys[i+1];
            c1Index = i;
            c2Index = i+1;
            break;
        }
    }

    // 3. Extract the 4 corner values
    let val11 = dataMatrix[r1Index][c1Index]; // Low Alt, Low Temp
    let val12 = dataMatrix[r1Index][c2Index]; // Low Alt, High Temp
    let val21 = dataMatrix[r2Index][c1Index]; // High Alt, Low Temp
    let val22 = dataMatrix[r2Index][c2Index]; // High Alt, High Temp

    // 3a. Return maximum continuous torque if values are not present
    //if (!val11 || !val12 || !val21 || !val22) return 83.3;

    // 4. Interpolate across the columns (Temperature) for both rows
    let valR1 = interpolateLinear(targetCol, c1, c2, val11, val12);
    let valR2 = interpolateLinear(targetCol, c1, c2, val21, val22);

    // 5. Interpolate across the rows (Altitude) using the two new values
    return interpolateLinear(targetRow, r1, r2, valR1, valR2);
}

// --- Individual Tab Calculators ---
function calculatePower(show = true) {
    let alt = document.getElementById("pwr-alt").value;
    let oat = document.getElementById("pwr-oat").value;
    let rpm = document.getElementById("pwr-rpm").value;

    let banner = document.getElementById("pwr-error");
    if (!isNumeric(alt) || !isNumeric(oat)) {
        banner.style.display = "block";
        banner.innerText = "Error: Please verify all input values are valid numbers.";
        return;
    } else { banner.style.display = "none"; }

    let warn = document.getElementById("pwr-warning");
    if (oat < -54) {
        warn.style.display = "block";
        warn.style.textAlign = "center";
        warn.innerText = "OUTSIDE AIR TEMPERATURE IS LESS THAN -54°C";
        document.getElementById("res-pwr-alt").innerText = "--";
        document.getElementById("res-pwr-oat").innerText = "--";
        document.getElementById("res-pwr-isa").innerText = "--";
        document.getElementById("res-pwr-prop").innerText = "--";
        document.getElementById("res-pwr-to").innerText = "--";
        document.getElementById("res-pwr-climb").innerText = "--";
        document.getElementById("res-pwr-max").innerText = "--";
        document.getElementById("res-pwr-norm").innerText = "--";
        document.getElementById("res-pwr-econ").innerText = "--";
    } else { warn.style.display = "none";
        document.getElementById("res-pwr-alt").innerText = alt + " ft";
        document.getElementById("res-pwr-oat").innerText = oat + "°C";
        document.getElementById("res-pwr-isa").innerText = getISAString(oat, alt);
        document.getElementById("res-pwr-prop").innerText = "Cruise Power (" + rpm + " rpm)";
        let takeoff = getBilinearInterpolation(oat, alt / 100, tableTakeoffOATKeys, tableTakeoffFLKeys, tableTakeoffPower);
        document.getElementById("res-pwr-to").innerText = takeoff <= 0  || takeoff > 100 || alt > 13000 ? "N/A" : parseFloat(takeoff).toFixed(1) + "%";
        document.getElementById("res-pwr-climb").innerText = parseFloat(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableClimbPower)).toFixed(1) + "%";
        document.getElementById("res-pwr-max").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableMaxCruisePower), rpm)).toFixed(1) + "%";
        document.getElementById("res-pwr-norm").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableNormCruisePower), rpm)).toFixed(1) + "%";
        document.getElementById("res-pwr-econ").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableEconCruisePower), rpm)).toFixed(1) + "%";
    }

    if (show) showModal('tab-power');
}

function calculateTakeoff(show = true) {
    let weight = document.getElementById("to-weight").value;
    let alt = document.getElementById("to-alt").value;
    let oat = document.getElementById("to-oat").value;
    let windDir = document.getElementById("to-windDir").value;
    let windSpeed = document.getElementById("to-windSpeed").value;
    let course = document.getElementById("to-course").value;
    let slope = document.getElementById("to-slope").value;
    let cond = document.querySelector('input[name="to-cond"]:checked').value;

    let banner = document.getElementById("to-error");
    if (!isNumeric(weight) || !isNumeric(alt) || !isNumeric(oat) || !isNumeric(windDir) ||
        !isNumeric(windSpeed) || !isNumeric(course) || !isNumeric(slope)) {
        banner.style.display = "block";
        banner.innerText = "Error: Please verify all input values are valid numbers.";
        return;
    } else { banner.style.display = "none"; }

    let windComp = getWindComponents(windSpeed, getWindAngle(windDir, course));
    document.getElementById("res-to-isa").innerText = getISAString(oat, alt);
    document.getElementById("res-to-xwind").innerText = windComp[1];
    document.getElementById("res-to-hwind").innerText = windComp[3];

    let takeoff = getBilinearInterpolation(oat, alt / 100, tableTakeoffOATKeys, tableTakeoffFLKeys, tableTakeoffPower);
    document.getElementById("takeoff-tq").innerText = takeoff <= 0  || takeoff > 100 ? "N/A" : parseFloat(takeoff).toFixed(1) + "%";

    let data = getTakeoffPerformance(weight, alt, oat, windDir, windSpeed, course, slope, cond);
    document.getElementById("res-to-gr").innerText = data[0] + " ft";
    document.getElementById("res-to-d50").innerText = data[1] + " ft";
    document.getElementById("res-to-astop").innerText = data[2] + " ft";
    document.getElementById("res-up-gr").innerText = data[3] + " ft";
    document.getElementById("res-up-d50").innerText = data[4] + " ft";
    document.getElementById("res-up-astop").innerText = data[5] + " ft";

    if (show) showModal('tab-takeoff');
}

function calculateClimb(show = true) {
    let weight = document.getElementById("cl-weight").value;
    let sAlt = document.getElementById("cl-startAlt").value;
    let sOAT = document.getElementById("cl-startOAT").value;
    let eAlt = document.getElementById("cl-endAlt").value;
    let eOAT = document.getElementById("cl-endOAT").value;

    let banner = document.getElementById("cl-error");
    if (!isNumeric(weight) || !isNumeric(sAlt) || !isNumeric(sOAT) || !isNumeric(eAlt) || !isNumeric(eOAT)) {
        banner.style.display = "block";
        banner.innerText = "Error: Please verify all input values are valid numbers.";
        return;
    } else if (eAlt <= sAlt) {
        banner.style.display = "block";
        banner.innerText = "Error: Ending altitude must be greater than starting altitude.";
        return;
    } else { banner.style.display = "none"; }

    let sRoc = getRateOfClimb(weight, sAlt, sOAT);
    let eRoc = getRateOfClimb(weight, eAlt, eOAT);
    let sTime = getTimeToClimb(weight, sAlt, sOAT);
    let eTime = getTimeToClimb(weight, eAlt, eOAT);
    let sFuel = getFuelToClimb(weight, sAlt, sOAT);
    let eFuel = getFuelToClimb(weight, eAlt, eOAT);
    let sDist = getDistanceToClimb(weight, sAlt, sOAT);
    let eDist = getDistanceToClimb(weight, eAlt, eOAT);

    let warn = document.getElementById("climb-warning");
    if (sTime < 0 || eTime < 0 || sFuel < 0 || eFuel < 0 || sDist < 0 || eDist < 0) {
        warn.style.display = "block";
        warn.style.textAlign = "center";
        warn.innerText = "OUTSIDE AIR TEMPERATURE IS LESS THAN -54°C";
        document.getElementById("climb-tq").innerText = "--";
        document.getElementById("res-climb-sroc").innerText = "--";
        document.getElementById("res-climb-eroc").innerText = "--";
        document.getElementById("res-climb-diff").innerText = "--";
        document.getElementById("res-climb-time").innerText = "--";
        document.getElementById("res-climb-fuel").innerText = "--";
        document.getElementById("res-climb-dist").innerText = "--";
    } else { warn.style.display = "none";
        document.getElementById("climb-tq").innerText = parseFloat(getBilinearInterpolation(sOAT, sAlt / 100, tableOATKeys, tableFLKeys, tableClimbPower)).toFixed(1) + "%";
        document.getElementById("res-climb-sroc").innerText = sRoc + " fpm";
        document.getElementById("res-climb-eroc").innerText = eRoc + " fpm";
        document.getElementById("res-climb-diff").innerText = Math.round(eAlt - sAlt) + " ft";
        document.getElementById("res-climb-time").innerText = convertTimeToString(eTime - sTime);
        document.getElementById("res-climb-fuel").innerText = Math.round(eFuel - sFuel) + " gal";
        document.getElementById("res-climb-dist").innerText = Math.round(eDist - sDist) + " nm";
    }

    if (show) showModal('tab-climb');
}

function calculateCruise(show = true) {
    let alt = document.getElementById("cr-alt").value;
    let oat = document.getElementById("cr-oat").value;
    let rpm = document.getElementById("cr-rpm").value;

    let banner = document.getElementById("cr-error");
    if (!isNumeric(alt) || !isNumeric(oat)) {
        banner.style.display = "block";
        banner.innerText = "Error: Please verify all input values are valid numbers.";
        return;
    } else { banner.style.display = "none"; }

    let isaDelta = getISAString(oat, alt);
    document.getElementById("res-cr-isa").innerText = isaDelta;
    document.getElementById("res-cr-rpm").innerText = rpm + " rpm";

    let maxC = getMaxCruisePerformance(alt, oat);
    if (maxC == 0 || maxC == -1) {
        document.getElementById("res-max-tq").innerText = "--";
        document.getElementById("res-max-ff").innerText = "--";
        document.getElementById("res-max-kias").innerText = "--";
        document.getElementById("res-max-ktas").innerText = "--";
    } else {
        document.getElementById("res-max-tq").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableMaxCruisePower), rpm)).toFixed(1);
        document.getElementById("res-max-ff").innerText = maxC[1];
        document.getElementById("res-max-kias").innerText = maxC[2];
        document.getElementById("res-max-ktas").innerText = maxC[3];
    }

    let normC = getNormalCruisePerformance(alt, oat);
    if (normC == -1) {
        document.getElementById("res-norm-tq").innerText = "--";
        document.getElementById("res-norm-ff").innerText = "--";
        document.getElementById("res-norm-kias").innerText = "--";
        document.getElementById("res-norm-ktas").innerText = "--";
    } else {
        document.getElementById("res-norm-tq").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableNormCruisePower), rpm)).toFixed(1);
        document.getElementById("res-norm-ff").innerText = normC[1];
        document.getElementById("res-norm-kias").innerText = normC[2];
        document.getElementById("res-norm-ktas").innerText = normC[3];
    }

    let econC = getEconomyCruisePerformance(alt, oat);
    if (econC == -1) {
        document.getElementById("res-econ-tq").innerText = "--";
        document.getElementById("res-econ-ff").innerText = "--";
        document.getElementById("res-econ-kias").innerText = "--";
        document.getElementById("res-econ-ktas").innerText = "--";
    } else {
        document.getElementById("res-econ-tq").innerText = parseFloat(getAlternateTorque(getBilinearInterpolation(oat, alt / 100, tableOATKeys, tableFLKeys, tableEconCruisePower), rpm)).toFixed(1);
        document.getElementById("res-econ-ff").innerText = econC[1];
        document.getElementById("res-econ-kias").innerText = econC[2];
        document.getElementById("res-econ-ktas").innerText = econC[3];
    }

    if (show) showModal('tab-cruise');
}

function calculateLanding(show = true) {
    let weight = document.getElementById("ld-weight").value;
    let alt = document.getElementById("ld-alt").value;
    let oat = document.getElementById("ld-oat").value;
    let windDir = document.getElementById("ld-windDir").value;
    let windSpeed = document.getElementById("ld-windSpeed").value;
    let course = document.getElementById("ld-course").value;
    let slope = document.getElementById("ld-slope").value;
    let cond = document.querySelector('input[name="ld-cond"]:checked').value;
    let iceMode = document.getElementById("ld-ice").checked ? "Y" : "N";

    let flapsFullHeader = document.getElementById("header-flaps-full");
    let flapsTOHeader = document.getElementById("header-flaps-to");
    let flapsUpHeader = document.getElementById("header-flaps-up");
    let groundRollHeader = document.getElementById("header-ground-roll");
    let obst50ftHeader = document.getElementById("header-50ft");
    let fGR = document.getElementById("res-land-fgr");
    let fD50 = document.getElementById("res-land-fd50");
    let toGR = document.getElementById("res-land-togr");
    let toD50 = document.getElementById("res-land-tod50");

    let banner = document.getElementById("ld-error");
    if (!isNumeric(weight) || !isNumeric(alt) || !isNumeric(oat) || !isNumeric(windDir) ||
        !isNumeric(windSpeed) || !isNumeric(course) || !isNumeric(slope)) {
        banner.style.display = "block";
        banner.innerText = "Error: Please verify all input values are valid numbers.";
        return;
    } else { banner.style.display = "none"; }

    let overweightBanner = document.getElementById("overweight-banner");

    if (weight > 7600) {
        let overweight = weight - 7600;
        weight = 7600;
        overweightBanner.className = "section-alert" ;
        overweightBanner.innerText = "-- OVER LANDING WEIGHT BY " + overweight + (overweight > 1 ? " LBS --" : " LB --");
    } else {
        overweightBanner.className = "" ;
        overweightBanner.innerText = "";
    }

    let windComp = getWindComponents(windSpeed, getWindAngle(windDir, course));
    document.getElementById("res-ld-isa").innerText = getISAString(oat, alt);
    document.getElementById("res-ld-xwind").innerText = windComp[1];
    document.getElementById("res-ld-hwind").innerText = windComp[3];

    let data = getLandingPerformance(weight, alt, oat, windDir, windSpeed, course, slope, cond, iceMode);
    fGR.innerText = iceMode == "Y" ? "Not Authorized" : data[0] + " ft";
    fD50.innerText = iceMode == "Y" ? "Not Authorized" : data[1] + " ft";
    toGR.innerText = data[2] + " ft";
    toD50.innerText = data[3] + " ft";
    document.getElementById("res-land-upgr").innerText = data[4] + " ft";
    document.getElementById("res-land-upd50").innerText = data[5] + " ft";

    if (iceMode === "Y") {
        flapsFullHeader.innerText = "Flaps FULL (Pusher Ice Mode)";
        fGR.style.color = "#ef4444";
        fD50.style.color = "#ef4444";
        flapsTOHeader.innerText = "Flaps T/O (Pusher Ice Mode)";
        flapsTOHeader.style.color = "yellow";
        flapsUpHeader.innerText = "Flaps UP (Pusher Ice Mode - EMERGENCY)";
        groundRollHeader.style.color = "yellow";
        obst50ftHeader.style.color = "yellow";
        toGR.style.color = "yellow";
        toD50.style.color = "yellow";
    } else {
        flapsFullHeader.innerText = "Flaps FULL";
        fGR.style.color = "";
        fD50.style.color = "";
        flapsTOHeader.innerText = "Flaps T/O";
        flapsTOHeader.style.color = "";
        flapsUpHeader.innerText = "Flaps UP";
        groundRollHeader.style.color = "";
        obst50ftHeader.style.color = "";
        toGR.style.color = "";
        toD50.style.color = "";
    }

    if (show) showModal('tab-landing');
}

// --- Core Math & Lookup Functions ---
function populateWeightPickers() {
    const weightIds = ['to-weight', 'cl-weight', 'ld-weight'];
    let options = '';

    for (let i = 8000; i >= 6000; i -= 50) {
        options += `<option value="${i}">${i.toLocaleString()}</option>`;
    }

    weightIds.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = "7600"; // Default starting weight
        }
    });
}

function populateAirfieldAltPickers() {
    const airfieldIds = ['to-alt', 'ld-alt'];
    let options = '';

    for (let i = 13000; i >= 0; i -= 500) {
        if (i === 0) {
            options += `<option value="0">Sea Level</option>`;
        } else {
            options += `<option value="${i}">${i.toLocaleString()}</option>`;
        }

    }

    airfieldIds.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = startAlt.toFixed(0); // Default starting elevation
        }
    });
}

function populateAltitudePickers() {
    const altitudeIds = ['pwr-alt', 'cl-startAlt', 'cl-endAlt', 'cr-alt'];
    let options = '';
    for (let i = 34000; i >= 18000; i -= 1000) {
        options += `<option value="${i}">${i.toLocaleString()}</option>`;
    }

    for (let i = 17500; i >= 0; i -= 500) {
        if (i === 0) {
            options += `<option value="0">Sea Level</option>`;
        } else {
            options += `<option value="${i}">${i.toLocaleString()}</option>`;
        }
    }

    altitudeIds.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            if (selectEl.id === "cl-startAlt") {
                selectEl.value = startAlt; // Default starting elevation
            } else {
                selectEl.value = endAlt; // Default starting elevation
            }

        }
    });
}

function populateOATPickers() {
    const ids = ['pwr-oat', 'cl-startOAT', 'cl-endOAT', 'cr-oat'];
    let options = '';

    for (let i = 49; i >= -54; i -= 1) {
        options += `<option value="${i}">${i}</option>`;
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            if (selectEl.id === "cl-startOAT") {
                selectEl.value = startOAT.toFixed(0); // Default starting OAT
            } else {
                selectEl.value = endOAT.toFixed(0);
            }
        }
    });
}

function populateAirfieldOATPickers() {
    const ids = ['to-oat', 'ld-oat'];
    let options =  "";

    for (let i = 49; i >= -25; i -= 1) {
        options += `<option value="${i}">${i}</option>`;
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = startOAT; // Default starting OAT
        }
    });
}

function populateRPMPickers() {
    const ids = ['pwr-rpm', 'cr-rpm'];
    let options = "";

    for (let i = 1700; i >= 1500; i += -10) {
        options += `<option value="${i}">${i}</option>`;
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = "1700"; // Default starting RPM
        }
    });
}

function populateHeadingPickers() {
    const ids = ['to-windDir', 'to-course', 'ld-windDir', 'ld-course'];
    let options = "";

    for (let i = 10; i <= 360; i += 10) {
        options += `<option value="${i}">${i}</option>`;
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = "360"; // Default starting heading
        }
    });
}

function populateSpeedPickers() {
    const ids = ['to-windSpeed', 'ld-windSpeed'];
    let options = "";

    for (let i = 30; i >= 0; i -= 1) {
        options += `<option value="${i}">${i}</option>`;
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = "0"; // Default starting speed
        }
    });
}

function populateSlopePickers() {
    const ids = ['to-slope', 'ld-slope'];
    let options = "";

    for (let i = 3; i >= -3.05; i -= 0.1) {
        if (i.toFixed(1) == 0) {
            options += `<option value="0">0</option>`;
        } else {
            options += `<option value="${i.toFixed(1)}">${i.toFixed(1)}</option>`;
        }
    }

    ids.forEach(id => {
        let selectEl = document.getElementById(id);
        if (selectEl) {
            selectEl.innerHTML = options;
            selectEl.value = "0"; // Default starting slope
        }
    });
}

function getAlternateTorque(normTQ, newRPM) {
    let hp = (normTQ * 1700) / 5252;
    return (hp * 5252) / newRPM;
}

function getTakeoffPerformance(weight, altitude, oat, windDirection, windSpeed, course, slope, runwayCondition) {
    let windComponents = getWindComponents(windSpeed, getWindAngle(windDirection, course));
    let headwind = windComponents[2];
    let flapsTOGR, flapsTOD50, flapsTOastop, flapsUPGR, flapsUPD50, flapsUPastop;

    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let pressureAltitude = Math.min(Math.max(altitude, 0), 10000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -55), 40);

    let distanceAssist = headwind >= 0;
    let slopeAssist = slope <= 0;

    let distanceFactor = Math.abs(Math.min(Math.max(headwind / 10.0, -3), 3));
    let slopeFactor = Math.abs(Math.min(Math.max(slope / 1.0, -3), 3));

    let gr = 0.0, d50 = 0.0, grWindChange = 0.0, d50WindChange = 0.0, grSlopeChange = 0.0, d50SlopeChange = 0.0;

    // Flaps T/O
    gr = getTripleLookup(tableTOPerfTOGR, aircraftWeight, pressureAltitude, isaDelta);
    d50 = getTripleLookup(tableTOPerfTOD50, aircraftWeight, pressureAltitude, isaDelta);

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.14) * gr) : ((distanceFactor * 0.22) * gr);
        d50WindChange = distanceAssist ? -((distanceFactor * 0.11) * d50) : ((distanceFactor * 0.22) * d50);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? -((slopeFactor * 0.01) * gr) : ((slopeFactor * 0.11) * gr);
        d50SlopeChange = slopeAssist ? -((slopeFactor * 0.01) * d50) : ((slopeFactor * 0.11) * d50);
    }

    flapsTOGR = gr + grWindChange + grSlopeChange;
    flapsTOD50 = d50 + d50WindChange + d50SlopeChange;

    let takeoffDistance = gr + grWindChange + grSlopeChange;
    let abortFactor = gr * 0.8;

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.09) * gr) : ((distanceFactor * 0.40) * gr);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? ((slopeFactor * 0.06) * gr) : -((slopeFactor * 0.01) * gr);
    }

    let grRunwayChange = runwayCondition === 'W' ? gr * 0.5 : (runwayCondition === 'I' ? gr : 0.0);
    flapsTOastop = takeoffDistance + abortFactor + grWindChange + grSlopeChange + grRunwayChange;

    // Flaps UP
    gr = getTripleLookup(tableTOPerfUPGR, aircraftWeight, pressureAltitude, isaDelta);
    d50 = getTripleLookup(tableTOPerfUPD50, aircraftWeight, pressureAltitude, isaDelta);

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.14) * gr) : ((distanceFactor * 0.22) * gr);
        d50WindChange = distanceAssist ? -((distanceFactor * 0.11) * d50) : ((distanceFactor * 0.22) * d50);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? -((slopeFactor * 0.01) * gr) : ((slopeFactor * 0.11) * gr);
        d50SlopeChange = slopeAssist ? -((slopeFactor * 0.01) * d50) : ((slopeFactor * 0.11) * d50);
    }

    flapsUPGR = gr + grWindChange + grSlopeChange;
    flapsUPD50 = d50 + d50WindChange + d50SlopeChange;

    takeoffDistance = gr + grWindChange + grSlopeChange;
    abortFactor = gr;

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.09) * gr) : ((distanceFactor * 0.40) * gr);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? ((slopeFactor * 0.06) * gr) : -((slopeFactor * 0.01) * gr);
    }

    grRunwayChange = runwayCondition === 'W' ? gr * 0.5 : (runwayCondition === 'I' ? gr : 0.0);
    flapsUPastop = takeoffDistance + abortFactor + grWindChange + grSlopeChange + grRunwayChange;

    return [Math.round(flapsTOGR), Math.round(flapsTOD50), Math.round(flapsTOastop), Math.round(flapsUPGR), Math.round(flapsUPD50), Math.round(flapsUPastop)];
}

function getRateOfClimb(weight, altitude, oat) {
    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let pressureAltitude = Math.min(Math.max(altitude, 0), 34000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -55), 40);
    return Math.round(getTripleLookup(tableROC, aircraftWeight, pressureAltitude, isaDelta));
}

function getTimeToClimb(weight, altitude, oat) {
    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -20), 20);
    let pressureAltitude = altitude < 0 ? 0 : altitude;
    //if (isaDelta < 0 && pressureAltitude > 24000) return -1;
    if (oat < -54) return -1
    pressureAltitude = Math.min(pressureAltitude, 34000);
    return getTripleLookup(tableTimeToClimb, aircraftWeight, pressureAltitude, isaDelta);
}

function getFuelToClimb(weight, altitude, oat) {
    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -20), 20);
    let pressureAltitude = altitude < 0 ? 0 : altitude;
    //if (isaDelta < 0 && pressureAltitude > 24000) return -1;
    if (oat < -54) return -1
    pressureAltitude = Math.min(pressureAltitude, 34000);
    return getTripleLookup(tableFuelToClimb, aircraftWeight, pressureAltitude, isaDelta);
}

function getDistanceToClimb(weight, altitude, oat) {
    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -20), 20);
    let pressureAltitude = altitude < 0 ? 0 : altitude;
    //if (isaDelta < 0 && pressureAltitude > 24000) return -1;
    if (oat < -54) return -1
    pressureAltitude = Math.min(pressureAltitude, 34000);
    return getTripleLookup(tableDistanceToClimb, aircraftWeight, pressureAltitude, isaDelta);
}

function getMaxCruisePerformance(altitude, oat) {
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -20), 30);
    if (altitude < 24000) return 0;
    if (oat <= -55) return -1;

    let torque = getCruiseLookup(tableMaxCruisePerformance, cruiseSetting.TQ, 8000, altitude, isaDelta).toFixed(1);
    let fuelFlow = getCruiseLookup(tableMaxCruisePerformance, cruiseSetting.FF, 8000, altitude, isaDelta).toFixed(1);
    let ias = Math.round(getCruiseLookup(tableMaxCruisePerformance, cruiseSetting.IAS, 8000, altitude, isaDelta));
    let tas = Math.round(getCruiseLookup(tableMaxCruisePerformance, cruiseSetting.TAS, 8000, altitude, isaDelta));
    return [torque, fuelFlow, ias, tas];
}

function getNormalCruisePerformance(altitude, oat) {
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -30), 30);
    if (oat <= -55) return -1;

    let torque = getCruiseLookup(tableNormalCruisePerformance, cruiseSetting.TQ, 8000, altitude, isaDelta).toFixed(1);
    let fuelFlow = getCruiseLookup(tableNormalCruisePerformance, cruiseSetting.FF, 8000, altitude, isaDelta).toFixed(1);
    let ias = Math.round(getCruiseLookup(tableNormalCruisePerformance, cruiseSetting.IAS, 8000, altitude, isaDelta));
    let tas = Math.round(getCruiseLookup(tableNormalCruisePerformance, cruiseSetting.TAS, 8000, altitude, isaDelta));
    return [torque, fuelFlow, ias, tas];
}

function getEconomyCruisePerformance(altitude, oat) {
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -30), 5);
    if (oat <= -55) return -1;

    let torque = getCruiseLookup(tableEconomyCruisePerformance, cruiseSetting.TQ, 8000, altitude, isaDelta).toFixed(1);
    let fuelFlow = getCruiseLookup(tableEconomyCruisePerformance, cruiseSetting.FF, 8000, altitude, isaDelta).toFixed(1);
    let ias = Math.round(getCruiseLookup(tableEconomyCruisePerformance, cruiseSetting.IAS, 8000, altitude, isaDelta));
    let tas = Math.round(getCruiseLookup(tableEconomyCruisePerformance, cruiseSetting.TAS, 8000, altitude, isaDelta));
    return [torque, fuelFlow, ias, tas];
}

function getLandingPerformance(weight, altitude, oat, windDirection, windSpeed, course, slope, runwayCondition, iceMode) {
    let windComponents = getWindComponents(windSpeed, getWindAngle(windDirection, course));
    let headwind = windComponents[2];
    let aircraftWeight = Math.min(Math.max(weight, 6000), 8000);
    let pressureAltitude = Math.min(Math.max(altitude, 0), 10000);
    let isaDelta = Math.min(Math.max(convertToISA(oat, altitude), -55), 40);

    let distanceAssist = headwind >= 0;
    let slopeAssist = slope <= 0;
    let distanceFactor = Math.abs(Math.min(Math.max(headwind / 10.0, -3), 3));
    let slopeFactor = Math.abs(Math.min(Math.max(slope / 1.0, -3), 3));

    let gr = 0.0, d50 = 0.0, grWindChange = 0.0, d50WindChange = 0.0, grSlopeChange = 0.0, d50SlopeChange = 0.0;
    let grRunwayChange = 0.0, d50RunwayChange = 0.0, grPusherChange = 0.0, d50PusherChange = 0.0;

    // Flaps FULL
    gr = getTripleLookup(tableLandPerfFULLGR, aircraftWeight, pressureAltitude, isaDelta);
    d50 = getTripleLookup(tableLandPerfFULLD50, aircraftWeight, pressureAltitude, isaDelta);

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.09) * gr) : ((distanceFactor * 0.40) * gr);
        d50WindChange = distanceAssist ? -((distanceFactor * 0.06) * d50) : ((distanceFactor * 0.45) * d50);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? -((slopeFactor * 0.01) * gr) : ((slopeFactor * 0.06) * gr);
        d50SlopeChange = slopeAssist ? -((slopeFactor * 0.01) * d50) : ((slopeFactor * 0.06) * d50);
    }
    if (iceMode === 'Y') {
        grPusherChange = gr * .20;
        d50PusherChange = d50 * .20;
    }
    if (runwayCondition === 'W') {
        grRunwayChange = gr * 0.5;
        d50RunwayChange = d50 * 0.5;
    } else if (runwayCondition === 'I') {
        grRunwayChange = gr;
        d50RunwayChange = d50;
    }

    let flapsFULLGR = gr + grWindChange + grSlopeChange + grPusherChange + grRunwayChange;
    let flapsFULLD50 = d50 + d50WindChange + d50SlopeChange + d50PusherChange + d50RunwayChange;

    // Flaps T/O
    gr = getTripleLookup(tableLandPerfTOGR, aircraftWeight, pressureAltitude, isaDelta);
    d50 = getTripleLookup(tableLandPerfTOD50, aircraftWeight, pressureAltitude, isaDelta);

    if (distanceFactor > 0) {
        grWindChange = distanceAssist ? -((distanceFactor * 0.09) * gr) : ((distanceFactor * 0.40) * gr);
        d50WindChange = distanceAssist ? -((distanceFactor * 0.06) * d50) : ((distanceFactor * 0.45) * d50);
    }
    if (slopeFactor > 0) {
        grSlopeChange = slopeAssist ? -((slopeFactor * 0.01) * gr) : ((slopeFactor * 0.06) * gr);
        d50SlopeChange = slopeAssist ? -((slopeFactor * 0.01) * d50) : ((slopeFactor * 0.06) * d50);
    }
    if (iceMode === 'Y') {
        grPusherChange = gr * .20;
        d50PusherChange = d50 * .20;
    }
    if (runwayCondition === 'W') {
        grRunwayChange = gr * 0.5;
        d50RunwayChange = d50 * 0.5;
    } else if (runwayCondition === 'I') {
        grRunwayChange = gr;
        d50RunwayChange = d50;
    }

    let flapsTOGR = gr + grWindChange + grSlopeChange + grPusherChange + grRunwayChange;
    let flapsTOD50 = d50 + d50WindChange + d50SlopeChange + d50PusherChange + d50RunwayChange;
    let flapsUPGR = (gr * .25) + flapsTOGR;
    let flapsUPD50 = (d50 * .25) + flapsTOD50;

    return [Math.round(flapsFULLGR), Math.round(flapsFULLD50), Math.round(flapsTOGR), Math.round(flapsTOD50), Math.round(flapsUPGR), Math.round(flapsUPD50)];
}

function getISAString(oat, alt) {
    let isaDelta = convertToISA(oat, alt);
    let isa = Math.round(isaDelta);
    return isa < 0 ? isa : '+' + isa;
}

function getWindComponents(windSpeed, windAngle) {
    let xwind = windSpeed * Math.sin(windAngle * (Math.PI / 180));
    let xwindString = 'No Crosswind';
    if (Math.round(xwind) != 0) {
        let dir = xwind < 0 ? ' (Left)' : ' (Right)';
        let unit = Math.abs(Math.round(xwind)) > 1 ? ' knots' : ' knot';
        xwindString = Math.round(Math.abs(xwind)) + unit + dir;
    }

    let headwind = windSpeed * Math.cos(windAngle * (Math.PI / 180));
    let headwindString = 'No Headwind';
    if (Math.round(headwind) != 0) {
        let unit = Math.abs(Math.round(headwind)) > 1 ? ' knots' : ' knot';
        headwindString = Math.round(Math.abs(headwind)) + unit;
    }
    return [xwind, xwindString, headwind, headwindString];
}

function getWindAngle(windDirection, course) {
    let windAngle = windDirection - course;
    if (windAngle < -180) windAngle += 360;
    if (windAngle > 180) windAngle -= 360;
    return windAngle;
}

function getTripleLookup(table, primaryValue, secondaryValue, tertiaryValue) {
    let tempLimit = getLookupKeys(primaryValue, table);
    let lowerPrimary = tempLimit[0], higherPrimary = tempLimit[1];

    if (lowerPrimary == higherPrimary) {
        return getSubLookup(table.get(lowerPrimary), secondaryValue, tertiaryValue);
    } else {
        let lowVal = getSubLookup(table.get(lowerPrimary), secondaryValue, tertiaryValue);
        let highVal = getSubLookup(table.get(higherPrimary), secondaryValue, tertiaryValue);
        let percent = (primaryValue - lowerPrimary) / (higherPrimary - lowerPrimary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getSubLookup(subTable, secondaryValue, tertiaryValue) {
    let tempLimit = getLookupKeys(secondaryValue, subTable);
    let lowerSecondary = tempLimit[0], higherSecondary = tempLimit[1];

    if (lowerSecondary == higherSecondary) {
        return getTertiaryInterpolated(subTable.get(lowerSecondary), tertiaryValue);
    } else {
        let lowVal = getTertiaryInterpolated(subTable.get(lowerSecondary), tertiaryValue);
        let highVal = getTertiaryInterpolated(subTable.get(higherSecondary), tertiaryValue);
        let percent = (secondaryValue - lowerSecondary) / (higherSecondary - lowerSecondary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getTertiaryInterpolated(tertiaryTable, tertiaryValue) {
    let tempLimit = getLookupKeys(tertiaryValue, tertiaryTable);
    let lowerTertiary = tempLimit[0], higherTertiary = tempLimit[1];
    if (lowerTertiary == higherTertiary) {
        return tertiaryTable.get(lowerTertiary);
    } else {
        let lowVal = tertiaryTable.get(lowerTertiary);
        let highVal = tertiaryTable.get(higherTertiary);
        let percent = (tertiaryValue - lowerTertiary) / (higherTertiary - lowerTertiary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getCruiseLookup(table, setting, primaryValue, secondaryValue, tertiaryValue) {
    let tempLimit = getLookupKeys(primaryValue, table);
    let lowerPrimary = tempLimit[0], higherPrimary = tempLimit[1];

    if (lowerPrimary == higherPrimary) {
        return getCruiseSubLookup(table.get(lowerPrimary), setting, secondaryValue, tertiaryValue);
    } else {
        let lowVal = getCruiseSubLookup(table.get(lowerPrimary), setting, secondaryValue, tertiaryValue);
        let highVal = getCruiseSubLookup(table.get(higherPrimary), setting, secondaryValue, tertiaryValue);
        let percent = (primaryValue - lowerPrimary) / (higherPrimary - lowerPrimary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getCruiseSubLookup(subTable, setting, secondaryValue, tertiaryValue) {
    let tempLimit = getLookupKeys(secondaryValue, subTable);
    let lowerSecondary = tempLimit[0], higherSecondary = tempLimit[1];

    if (lowerSecondary == higherSecondary) {
        return getCruiseTertiaryInterpolated(subTable.get(lowerSecondary), setting, tertiaryValue);
    } else {
        let lowVal = getCruiseTertiaryInterpolated(subTable.get(lowerSecondary), setting, tertiaryValue);
        let highVal = getCruiseTertiaryInterpolated(subTable.get(higherSecondary), setting, tertiaryValue);
        let percent = (secondaryValue - lowerSecondary) / (higherSecondary - lowerSecondary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getCruiseTertiaryInterpolated(tertiaryTable, setting, tertiaryValue) {
    let tempLimit = getLookupKeys(tertiaryValue, tertiaryTable);
    let lowerTertiary = tempLimit[0], higherTertiary = tempLimit[1];
    if (lowerTertiary == higherTertiary) {
        return tertiaryTable.get(lowerTertiary)[setting];
    } else {
        let lowVal = tertiaryTable.get(lowerTertiary)[setting];
        let highVal = tertiaryTable.get(higherTertiary)[setting];
        let percent = (tertiaryValue - lowerTertiary) / (higherTertiary - lowerTertiary);
        return ((highVal - lowVal) * percent) + lowVal;
    }
}

function getLookupKeys(lookupKey, lookupMap) {
    let lowKey = 0, highKey = 0;
    for (let [key, value] of lookupMap) {
        if (key == lookupKey) {
            lowKey = key; highKey = key; break;
        } else {
            if (key < lookupKey) lowKey = key;
            if (key > lookupKey && highKey == 0) highKey = key;
        }
    }
    return [lowKey, highKey];
}

function getISAatALT(alt) {
    return (15 - (1.98 * alt) / 1000);
}

function convertToISA(oat, alt) {
    return (oat - (15 - (1.98 * alt) / 1000));
}

function convertTimeToString(time) {
    let minute = Math.floor(time);
    let second = Math.round((time % 1) * 60);
    return minute + 'm + ' + (second < 10 ? '0' : '') + second + 's';
}