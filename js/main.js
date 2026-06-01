// Normquerschnitte in mm2. Diese Liste wird genutzt, um aus dem
// theoretischen Querschnitt den naechstgroesseren Standardwert zu finden.
// Ab 240 mm2 sind auch parallele Leiter wie im Originalprogramm enthalten.
// USER-CONFIG-START: norm-cross-sections
const standardCrossSections = [
  { area: 0.75, label: "0,75 mm&sup2;", ampacity: 12 },
  { area: 1, label: "1,00 mm&sup2;", ampacity: 15 },
  { area: 1.5, label: "1,50 mm&sup2;", ampacity: 18 },
  { area: 2.5, label: "2,50 mm&sup2;", ampacity: 26 },
  { area: 4, label: "4,00 mm&sup2;", ampacity: 34 },
  { area: 6, label: "6,00 mm&sup2;", ampacity: 44 },
  { area: 10, label: "10,00 mm&sup2;", ampacity: 61 },
  { area: 16, label: "16,00 mm&sup2;", ampacity: 82 },
  { area: 25, label: "25,00 mm&sup2;", ampacity: 108 },
  { area: 35, label: "35,00 mm&sup2;", ampacity: 135 },
  { area: 50, label: "50,00 mm&sup2;", ampacity: 168 },
  { area: 70, label: "70,00 mm&sup2;", ampacity: 207 },
  { area: 95, label: "95,00 mm&sup2;", ampacity: 250 },
  { area: 120, label: "120,00 mm&sup2;", ampacity: 295 },
  { area: 150, label: "150,00 mm&sup2;", ampacity: 335 },
  { area: 185, label: "185,00 mm&sup2;", ampacity: 382 },
  { area: 240, label: "240,00 mm&sup2;", ampacity: 453 },
  { area: 300, label: "2 x 150 mm&sup2;", ampacity: 670 },
  { area: 370, label: "2 x 185 mm&sup2;", ampacity: 764 },
  { area: 450, label: "3 x 150 mm&sup2;", ampacity: 1005 },
  { area: 480, label: "2 x 240 mm&sup2;", ampacity: 906 },
  { area: 555, label: "3 x 185 mm&sup2;", ampacity: 1146 },
  { area: 720, label: "3 x 240 mm&sup2;", ampacity: 1359 },
  { area: 740, label: "4 x 185 mm&sup2;", ampacity: 1528 },
  { area: 960, label: "4 x 240 mm&sup2;", ampacity: 1812 }
];
// USER-CONFIG-END: norm-cross-sections

// Faktoren fuer Verlegeart und Haeufung aus dem Originalprogramm.
// A bis E entsprechen den Optionen im Dropdown "Verlegeart".
const layingFactors = {
  A: [1.0, 0.8, 0.7, 0.65, 0.6, 0.57, 0.54, 0.52, 0.5, 0.48, 0.45, 0.34, 0.41, 0.39, 0.38],
  B: [1.0, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.7, 0, 0, 0, 0, 0, 0],
  C: [1.0, 0.94, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
  D: [0.95, 0.81, 0.72, 0.68, 0.66, 0.64, 0.63, 0.62, 0.61, 0, 0, 0, 0, 0, 0],
  E: [0.95, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85]
};

// Alle wichtigen DOM-Elemente werden einmal gesammelt. Dadurch muessen wir
// querySelector nicht in jeder Funktion neu schreiben.
const form = document.querySelector("#voltageDropForm");
const controls = {
  voltage: document.querySelector("#voltage"),
  current: document.querySelector("#current"),
  length: document.querySelector("#length"),
  powerFactor: document.querySelector("#powerFactor"),
  power: document.querySelector("#power"),
  material: document.querySelector("#material"),
  allowedDrop: document.querySelector("#allowedDrop"),
  layingType: document.querySelector("#layingType"),
  cableCount: document.querySelector("#cableCount"),
  temperature: document.querySelector("#temperature"),
  crossSection: document.querySelector("#crossSection"),
  statePill: document.querySelector("#statePill"),
  standardCrossSection: document.querySelector("#standardCrossSection"),
  theoreticalCrossSection: document.querySelector("#theoreticalCrossSection"),
  maxLength: document.querySelector("#maxLength"),
  actualDrop: document.querySelector("#actualDrop"),
  consumerVoltage: document.querySelector("#consumerVoltage"),
  calculatedPower: document.querySelector("#calculatedPower"),
  correctionFactor: document.querySelector("#correctionFactor"),
  simpleSingleMetric: document.querySelector("#simpleSingleMetric"),
  simpleSingleCrossSection: document.querySelector("#simpleSingleCrossSection"),
  projectName: document.querySelector("#projectName"),
  infoButton: document.querySelector("#infoButton"),
  outputButton: document.querySelector("#outputButton")
};

// Merkt sich, ob der Benutzer zuletzt Strom oder Leistung geaendert hat.
// So kann das jeweils andere Feld automatisch nachgerechnet werden.
let lastChanged = "current";
let lastResult = null;

function parseDecimal(value) {
  const text = String(value).trim();

  // Deutsche Zahlen wie "3.680,00" sollen genauso funktionieren wie "3680.00".
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;

  return Number(normalized);
}

// Formatiert Zahlen fuer die Anzeige im deutschen Format.
function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

// Gibt einen Querschnitt mit Einheit aus oder einen Hinweis, wenn nichts passt.
function formatArea(value) {
  if (value === null) {
    return "au&szlig;erhalb";
  }

  if (typeof value === "object") {
    return value.label;
  }

  return `${formatNumber(value)} mm&sup2;`;
}

// Liest aus den Radio-Buttons, ob 1~ / GS oder 3~ gewaehlt wurde.
function getPhaseCount() {
  return Number(document.querySelector("input[name='phase']:checked").value);
}

// Faktor fuer Leistungsberechnung: P = sqrt(3) * U * I * cos(phi) bei Drehstrom.
function getPhaseVoltageFactor() {
  return getPhaseCount() === 3 ? Math.sqrt(3) : 1;
}

// Faktor fuer Spannungsfall: 2 bei 1~ / GS, sqrt(3) bei Drehstrom.
function getDropFactor() {
  return getPhaseCount() === 3 ? Math.sqrt(3) : 2;
}

function getSelectedOption(select) {
  return select.options[select.selectedIndex];
}

// Temperaturfaktor aus dem ausgewaehlten option-Attribut data-factor.
function getTemperatureFactor() {
  return parseDecimal(getSelectedOption(controls.temperature).dataset.factor);
}

// Temperaturkoeffizient des Materials aus data-alpha.
function getMaterialAlpha() {
  return parseDecimal(getSelectedOption(controls.material).dataset.alpha);
}

// Kombiniert Temperaturkorrektur und Verlegeart/Haeufung.
function getCorrectionFactor() {
  const layingType = controls.layingType.value;
  const cableIndex = Number(controls.cableCount.value);
  const layingFactor = layingFactors[layingType][cableIndex] || 0;
  return getTemperatureFactor() * layingFactor;
}

// Sammelt und berechnet alle Rohwerte aus dem Formular.
function getValues() {
  const voltage = parseDecimal(controls.voltage.value);
  const powerFactor = parseDecimal(controls.powerFactor.value);
  const phaseVoltageFactor = getPhaseVoltageFactor();
  let current = parseDecimal(controls.current.value);
  let power = parseDecimal(controls.power.value);

  if (lastChanged === "power" && Number.isFinite(power) && voltage > 0 && powerFactor > 0) {
    current = power / (phaseVoltageFactor * voltage * powerFactor);
    controls.current.value = formatNumber(current);
  } else if (Number.isFinite(current) && voltage > 0 && powerFactor > 0) {
    power = phaseVoltageFactor * voltage * current * powerFactor;
    controls.power.value = formatNumber(power);
  }

  return {
    voltage,
    current,
    length: parseDecimal(controls.length.value),
    powerFactor,
    power,
    gamma: parseDecimal(controls.material.value),
    allowedDropPercent: parseDecimal(controls.allowedDrop.value),
    crossSection: parseDecimal(controls.crossSection.value),
    temperature: parseDecimal(controls.temperature.value),
    alpha: getMaterialAlpha(),
    dropFactor: getDropFactor(),
    correctionFactor: getCorrectionFactor()
  };
}

// Prueft, ob alle Werte sinnvoll sind, bevor gerechnet wird.
function validate(values) {
  const required = [
    ["Nennspannung", values.voltage],
    ["Strom", values.current],
    ["Leitungsl&auml;nge", values.length],
    ["cos phi", values.powerFactor],
    ["Spannungsfall", values.allowedDropPercent],
    ["Querschnitt", values.crossSection]
  ];

  const invalid = required.find((entry) => !Number.isFinite(entry[1]) || entry[1] <= 0);
  if (invalid) {
    return `${invalid[0]} muss ein positiver Zahlenwert sein.`;
  }

  if (values.powerFactor > 1) {
    return "cos phi darf nicht gr&ouml;&szlig;er als 1 sein.";
  }

  if (values.correctionFactor <= 0) {
    return "Diese Kombination aus Verlegeart und Anzahl ist nicht vorgesehen.";
  }

  return "";
}

// Sucht den kleinsten Normquerschnitt, der rechnerisch und thermisch reicht.
function findNormCrossSection(theoretical, current, correctionFactor) {
  return standardCrossSections.find((crossSection) => {
    const correctedAmpacity = crossSection.ampacity * correctionFactor;
    return theoretical <= crossSection.area && current <= correctedAmpacity;
  }) || null;
}

// Aktualisiert die kleine Statusanzeige oben rechts im Ergebnisbereich.
function setState(text, mode = "") {
  controls.statePill.innerHTML = text;
  controls.statePill.className = mode ? `state-pill ${mode}` : "state-pill";
}

// Setzt alle Ergebnisfelder auf "-" und zeigt die Fehlermeldung an.
function showError(message) {
  lastResult = null;
  controls.standardCrossSection.textContent = "-";
  controls.theoreticalCrossSection.textContent = "-";
  controls.maxLength.textContent = "-";
  controls.actualDrop.textContent = "-";
  controls.consumerVoltage.textContent = "-";
  controls.calculatedPower.textContent = "-";
  controls.correctionFactor.textContent = "-";
  controls.simpleSingleCrossSection.textContent = "-";
  controls.simpleSingleMetric.classList.add("is-hidden");
  setState(message, "error");
}

// Hauptfunktion: liest Eingaben, berechnet alle Ergebnisse und schreibt sie in die Seite.
function calculate() {
  const values = getValues();
  const error = validate(values);

  if (error) {
    showError(error);
    return;
  }

  const allowedDropVolt = values.voltage * values.allowedDropPercent / 100;
  const temperatureMultiplier = 1 + values.alpha * (values.temperature - 20);
  const theoretical = (
    values.dropFactor * values.length * values.current * values.powerFactor /
    (values.gamma * allowedDropVolt)
  ) * temperatureMultiplier;
  const maxLength = (
    allowedDropVolt * values.gamma * values.crossSection /
    (values.dropFactor * values.current * values.powerFactor)
  ) / temperatureMultiplier;
  const actualDropVolt = (
    values.dropFactor * values.length * values.current * values.powerFactor /
    (values.gamma * values.crossSection)
  ) * temperatureMultiplier;
  const actualDropPercent = actualDropVolt / values.voltage * 100;
  const consumerVoltage = values.voltage - actualDropVolt;
  const normCrossSection = findNormCrossSection(theoretical, values.current, values.correctionFactor);

  lastResult = {
    values,
    theoretical,
    maxLength,
    actualDropVolt,
    actualDropPercent,
    consumerVoltage,
    normCrossSection
  };

  controls.standardCrossSection.innerHTML = formatArea(normCrossSection);
  controls.theoreticalCrossSection.innerHTML = `${formatNumber(theoretical)} mm&sup2;`;
  controls.maxLength.textContent = `${formatNumber(maxLength)} m`;
  controls.actualDrop.textContent = `${formatNumber(actualDropVolt)} V / ${formatNumber(actualDropPercent)} %`;
  controls.consumerVoltage.textContent = `${formatNumber(consumerVoltage)} V`;
  controls.calculatedPower.textContent = `${formatNumber(values.power)} W`;
  controls.correctionFactor.textContent = formatNumber(values.correctionFactor, 3);

  if (normCrossSection && normCrossSection.area >= 240) {
    controls.simpleSingleCrossSection.innerHTML = `${formatNumber(normCrossSection.area)} mm&sup2;`;
    controls.simpleSingleMetric.classList.remove("is-hidden");
  } else {
    controls.simpleSingleCrossSection.textContent = "-";
    controls.simpleSingleMetric.classList.add("is-hidden");
  }

  if (!normCrossSection) {
    setState("Bereich &uuml;berschritten", "warn");
  } else if (values.crossSection >= theoretical) {
    setState("Querschnitt reicht", "");
  } else {
    setState("Querschnitt zu klein", "warn");
  }
}

// Uebernimmt einen Dropdown-Wert in das zugehoerige Eingabefeld.
function applyPreset(select) {
  const targetId = select.dataset.presetFor;
  const target = document.querySelector(`#${targetId}`);

  if (!target || select.value === "") {
    return;
  }

  target.value = select.value;
  select.selectedIndex = 0;
  lastChanged = targetId === "power" ? "power" : "current";
  calculate();
}

// Erstellt wie im Original eine separate Ausgabe in einem neuen Fenster.
function openOutputWindow() {
  calculate();

  if (!lastResult) {
    window.alert("Bitte korrigiere zuerst die Eingaben.");
    return;
  }

  const { values, theoretical, maxLength, actualDropVolt, actualDropPercent, consumerVoltage, normCrossSection } = lastResult;
  const phaseText = getPhaseCount() === 3 ? "3~ Drehstrom" : "1~ Wechselstrom / Gleichstrom";
  const materialText = getSelectedOption(controls.material).textContent;
  const layingText = getSelectedOption(controls.layingType).textContent;
  const cableText = getSelectedOption(controls.cableCount).textContent;
  const temperatureText = getSelectedOption(controls.temperature).textContent;
  const now = new Date();
  const timestamp = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(now);
  const simpleSingleRow = normCrossSection && normCrossSection.area >= 240
    ? `<tr><th>Normquerschnitt einfache Leitung</th><td>${formatNumber(normCrossSection.area)} mm&sup2;</td></tr>`
    : "";

  const outputWindow = window.open("", "SpannungsfallAusgabe", "width=720,height=620,resizable=yes,scrollbars=yes");

  if (!outputWindow) {
    window.alert("Das Ausgabefenster wurde vom Browser blockiert.");
    return;
  }

  outputWindow.document.open();
  outputWindow.document.write(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Ausgabe Spannungsfall</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 28px; color: #202832; background: #f4f6f8; }
        h1 { margin: 0 0 6px; color: #164f9c; }
        h2 { margin-top: 28px; color: #c1272d; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; background: #fff; }
        th, td { border: 1px solid #b8c1ca; padding: 9px 10px; text-align: left; }
        th { width: 42%; background: #e9eef3; }
        .note { margin-top: 18px; color: #61707e; line-height: 1.45; }
        .print { margin-top: 18px; padding: 9px 14px; border: 0; border-radius: 6px; color: #fff; background: #164f9c; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Berechnungsergebnisse</h1>
      <div>${timestamp}</div>
      <h2>${controls.projectName.value || "neues Projekt"}</h2>
      <table>
        <tr><th>Nennspannung</th><td>${formatNumber(values.voltage)} V (${phaseText})</td></tr>
        <tr><th>Strom / Vorsicherung</th><td>${formatNumber(values.current)} A</td></tr>
        <tr><th>Leistung</th><td>${formatNumber(values.power)} W</td></tr>
        <tr><th>Leitungslaenge</th><td>${formatNumber(values.length)} m</td></tr>
        <tr><th>cos phi</th><td>${formatNumber(values.powerFactor)}</td></tr>
        <tr><th>Leitermaterial</th><td>${materialText}</td></tr>
        <tr><th>Max. Spannungsfall</th><td>${formatNumber(values.allowedDropPercent)} %</td></tr>
        <tr><th>Verlegeart</th><td>${layingText}</td></tr>
        <tr><th>Haeufung</th><td>${cableText}</td></tr>
        <tr><th>Umgebungstemperatur</th><td>${temperatureText}</td></tr>
        <tr><th>Gewaehlter Querschnitt</th><td>${formatNumber(values.crossSection)} mm&sup2;</td></tr>
      </table>
      <table>
        <tr><th>Mind. Normquerschnitt</th><td>${formatArea(normCrossSection)}</td></tr>
        ${simpleSingleRow}
        <tr><th>Theoretischer Querschnitt</th><td>${formatNumber(theoretical)} mm&sup2;</td></tr>
        <tr><th>Max. Leitungslaenge</th><td>${formatNumber(maxLength)} m</td></tr>
        <tr><th>Spannungsfall</th><td>${formatNumber(actualDropVolt)} V / ${formatNumber(actualDropPercent)} %</td></tr>
        <tr><th>Spannung am Verbraucher</th><td>${formatNumber(consumerVoltage)} V</td></tr>
        <tr><th>Korrekturfaktor</th><td>${formatNumber(values.correctionFactor, 3)}</td></tr>
      </table>
      <p class="note">Diese Ausgabe dient als Planungshilfe. Die Pruefung nach gueltigen Normen und Regeln der Technik bleibt erforderlich.</p>
      <button class="print" onclick="window.print()">Drucken</button>
    </body>
    </html>
  `);
  outputWindow.document.close();
}

document.querySelectorAll("[data-preset-for]").forEach((select) => {
  select.addEventListener("change", () => applyPreset(select));
});

form.addEventListener("input", (event) => {
  if (event.target.id === "power") {
    lastChanged = "power";
  }

  if (event.target.id === "current") {
    lastChanged = "current";
  }

  calculate();
});

form.addEventListener("change", (event) => {
  if (!event.target.matches("[data-preset-for]")) {
    calculate();
  }
});

form.addEventListener("reset", () => {
  lastChanged = "current";
  window.setTimeout(calculate, 0);
});

controls.infoButton.addEventListener("click", () => {
  window.alert(
    "Dieses Programm dient als Planungshilfe. Die Pruefung nach gueltigen Normen und Regeln der Technik bleibt erforderlich."
  );
});

controls.outputButton.addEventListener("click", openOutputWindow);

calculate();
