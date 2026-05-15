# AegisAir
### Shielding Every Breath.

AegisAir is an AI-powered IoT safety platform that detects gas leaks, smoke, and environmental hazards in real time and automatically triggers emergency responses to protect lives and property in residential and industrial environments.

---

## Overview

AegisAir is a smart gas leak and smoke detection alert system designed to reduce the risks of fire hazards, toxic exposure, and property damage caused by delayed detection and response. The system uses an ESP32 microcontroller integrated with MQ-2 gas sensors to detect LPG, methane, smoke, and carbon monoxide, along with a DHT22 sensor for temperature and humidity monitoring.

When unsafe gas concentrations are detected, AegisAir automatically activates local safety mechanisms such as buzzers, LED-based hazard indicators, exhaust fans, and gas shutoff valves. At the same time, it sends real-time SMS alerts and automated voice calls using Twilio. A web dashboard provides live monitoring, system diagnostics, historical data logging, and emergency visualization.

### Performance Highlights
- Gas leak detection within **2–5 seconds**
- Dashboard updates in **under 5 seconds**
- Alert delivery in **3–8 seconds**
- Detection reliability of **95%+**

AegisAir presents a scalable, affordable, and intelligent safety solution that integrates sensing, communication, automation, and cloud monitoring to significantly enhance safety and reduce the impact of gas-related accidents.

---

## Key Features

- Real-time detection of LPG, methane, smoke, and carbon monoxide
- Temperature and humidity monitoring
- Automatic exhaust fan activation
- Gas shutoff valve control
- Buzzer and LED-based alerts
- SMS and automated voice call notifications
- Live cloud dashboard
- Historical data logging and CSV export
- Emergency monitoring interface
- Remote actuator control
- Sensor health diagnostics
- OLED-based local visualization

---

## Hardware Components

| Component | Purpose |
|----------|---------|
| ESP32 | Main microcontroller with Wi-Fi |
| MQ-2 Sensor | Detects LPG, methane, smoke, and combustible gases |
| DHT22 | Temperature and humidity monitoring |
| Buzzer | Audible alert system |
| RGB LEDs | Multi-state hazard indication |
| Relay Module | Controls fan and gas valve |
| Servo Motor | Automatically closes gas valve |
| OLED Display | Local dashboard and graphs |
| Exhaust Fan | Ventilation during hazardous conditions |

---

## Software Stack

### Embedded
- Embedded C/C++
- Arduino Framework

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js
- WebSockets
- Railway

### Cloud
- Firebase Realtime Database

### Notifications
- Twilio SMS
- Twilio Voice Calls

---

## System Architecture

```text
MQ-2 + DHT22 Sensors
        │
        ▼
      ESP32
        │
        ▼
 Hazard Detection Engine
(FSM + Risk Scoring + Anomaly Detection)
        │
 ┌──────┴─────────────────────────┐
 ▼                                ▼
Safety Automation              Cloud Sync
(Fan, Buzzer, Valve)           Firebase
 ▼                                ▼
Local Response                Web Dashboard
                                 ▼
                         SMS / Voice Alerts
```

---

## Core Algorithms

### 1. Finite State Machine (FSM)

The system classifies hazards into five states:

- NORMAL
- CAUTION
- WARNING
- CRITICAL
- EMERGENCY

Each state triggers different automated actions.

---

### 2. Rate-of-Rise Spike Detection

Detects sudden gas concentration increases.

```text
rate = currentGas - previousGas

if rate > spikeThreshold:
    spikeDetected = true
```

This enables early warning before dangerous thresholds are crossed.

---

### 3. Sliding Window Anomaly Detection

Monitors recent readings to identify abnormal patterns.

```text
window = last N readings
mean = average(window)
std = standardDeviation(window)
zScore = (current - mean) / std
```

If the z-score exceeds a threshold, the reading is marked as anomalous.

---

### 4. Weighted Risk Scoring

Combines all sensor and algorithm outputs into one unified score.

```text
riskScore =
    gasWeight       * gasLevel +
    smokeWeight     * smokeLevel +
    tempWeight      * temperatureChange +
    humidityWeight  * humidityChange +
    spikeWeight     * spikeFlag +
    anomalyWeight   * anomalyFlag
```

---

### 5. Hysteresis Control

Prevents rapid switching between states.

```text
Enter WARNING at score >= 50
Exit WARNING  at score < 45
```

---

### 6. Sensor Smoothing (EMA)

Reduces noise in MQ-2 sensor readings.

```text
filtered = alpha * current + (1 - alpha) * previous
```

---

### 7. Alert Cooldown Logic

Avoids repeated notifications.

```text
if now - lastAlertTime > cooldown:
    sendAlert()
```

---

### 8. Timestamp Extraction from Firebase Push IDs

Decodes timestamps from Firebase-generated keys for accurate event ordering.

---

### 9. TimSort for Incident Ordering

Sorts historical events chronologically for dashboard visualization.

---

### 10. Optimistic UI Updates

Instantly updates dashboard controls while hardware actions execute asynchronously.

---

## Risk Classification

| Risk Score | State | Action |
|----------:|-------|--------|
| 0–24 | NORMAL | Monitoring only |
| 25–49 | CAUTION | LED warning |
| 50–69 | WARNING | Buzzer + dashboard alert |
| 70–84 | CRITICAL | Exhaust fan activation |
| 85+ | EMERGENCY | Gas shutoff + SMS + Voice call |

---

## Emergency Response Workflow

1. Sensors detect abnormal gas or smoke levels.
2. Rate-of-rise algorithm identifies sudden spikes.
3. Sliding window confirms anomaly.
4. Weighted risk score is calculated.
5. FSM determines hazard state.
6. Safety mechanisms activate automatically.
7. Cloud dashboard updates in real time.
8. SMS and voice alerts are sent.
9. Incident is logged for historical analysis.

---

## Firebase Data Structure

```json
{
  "devices": {
    "device_001": {
      "gas": 412,
      "smoke": 287,
      "temperature": 32.4,
      "humidity": 61.2,
      "riskScore": 78,
      "state": "CRITICAL",
      "timestamp": 1712345678
    }
  }
}
```

---


## Applications

- Smart Homes
- Apartments
- Factories
- Chemical Plants
- Laboratories
- Warehouses
- Hotels
- Hospitals

---

## Future Enhancements


- Edge AI for predictive hazard detection
- Mobile application
- OTA firmware updates
- Battery backup system
- Multi-device deployment support
- Advanced sensor fusion

---

## License

Apache License 2.0 
