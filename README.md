# Berechnungsprogramm Spannungsfall

Ein modernes Webanwendung zur Berechnung des Spannungsfalls auf Leitungen und Kabeln gemäß elektrotechnischen Normen.

## 🎯 Funktionalität

Das Programm berechnet Spannungsverluste in elektrischen Leitungen und Kabeln basierend auf:

- **Nennspannungen**: 6V, 12V, 24V, 48V, 110V, 230V, 400V, 690V
- **Stromstärke / Vorsicherungen**: 2A bis 2000A
- **Leitungslängen**: 1m bis 1.000.000m
- **Leistungsfaktor (cosinus phi)**: Für Drehstrom-Anwendungen
- **Leitermaterialien**: Kupfer, Aluminium, Silber, Gold, Messing
- **Verlegeart**: 5 verschiedene Verlegungsszenarien (A-E)
- **Umgebungstemperatur**: 10°C bis 60°C mit automatischen Korrekturfaktoren

## 📊 Berechnete Ergebnisse

Das Programm liefert folgende Werte:

- **Normquerschnitt (DIN/VDE)**: Der nächstgrößere Standardquerschnitt
- **Theoretischer Querschnitt**: Exakt berechneter Querschnitt
- **Maximale Leitungslänge**: Für den gewählten Querschnitt
- **Spannungsfall**: In Volt und Prozent
- **Spannung am Verbraucher**: Nach Spannungsverlust
- **Korrekturfaktoren**: Für Temperatur und Verlegeart

## 🏗️ Projektstruktur

```
Version-1/
├── index.html          # HTML-Struktur des Formulars
├── js/
│   └── main.js         # Berechnungslogik und Interaktivität
├── styles/
│   └── style.css       # Responsive Design und Styling
├── img/                # Verzeichnis für Bilder (optional)
├── .git/               # Git-Versionskontrolle
└── README.md           # Diese Datei
```

## 🚀 Installation & Verwendung

### Lokal im Browser öffnen

1. Datei `/index.html` im Webbrowser öffnen
2. Eingabefelder mit den gewünschten Werten ausfüllen
3. Ergebnisse werden in Echtzeit berechnet

### Anforderungen

- Moderner Webbrowser mit JavaScript-Unterstützung
- Keine externe Abhängigkeiten

## ⚙️ Technologie

- **HTML5**: Semantische Markup-Struktur
- **CSS3**: Responsive Grid-Layout, moderne Designmuster
- **Vanilla JavaScript**: Keine Framework-Abhängigkeiten
- **Lokale Berechnung**: Alle Berechnungen erfolgen im Browser (offline-fähig)

## 🎛️ Hauptfeatures

### Preset-Selektoren
Vordefinierte Werte für schnelle Auswahl:
- Nennspannungen
- Standard-Stromstärken (Vorsicherungen)
- Leitungslängen
- Leistungsfaktoren
- Querschnitte

### Echtzeitberechnung
Ergebnisse werden sofort aktualisiert, wenn Eingabefelder geändert werden.

### Konfigurierbarkeit
Benutzer können Werte manuell eingeben und/oder aus Presets wählen.

### Informationsbutton
Detaillierte Erklärungen und Dokumentation verfügbar.

## 🔧 Anpassungen

Das Programm ist für Erweiterungen vorbereitet. Folgende Bereiche können angepasst werden:

- **Normquerschnitte** (`standardCrossSections`): Neue Leiterquerschnitte hinzufügen
- **Verlegefaktoren** (`layingFactors`): Nach lokalen Normen anpassen
- **Preset-Werte**: Dropdown-Optionen erweitern

Die entsprechenden Stellen sind in `js/main.js` mit Kommentaren gekennzeichnet:
- `USER-CONFIG-START` und `USER-CONFIG-END`

## 📝 Lizenz

Projekt für Bildungszwecke. Entwickelt am Raspberry Pi 5 mit Trixie OS.

## 🐛 Debugging

Browser-Konsole (`F12` > Console) zeigt Validierungsmeldungen und eventuelle Fehler.

---

**Version**: 1.0  
**Commit**: 18.06.2026 vom Raspi 5 Trixie
