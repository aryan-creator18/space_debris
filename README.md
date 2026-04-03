# 🛰️ Space Debris Tracking & Collision Analysis Platform

An interactive, high-performance WebGL platform for tracking, modeling, and analyzing Low Earth Orbit (LEO) satellite trajectories and collision probabilities. Built for aerospace enthusiasts, students, and researchers, this project combines robust Data Science (Pandas, XGBoost ML, Keplerian Physics) with a visually stunning React `globe.gl` 3D interface.

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-Live_HMR-purple)
![Deployment](https://img.shields.io/badge/Deploy-Cloud_Ready-black)

## 🌟 Core Capabilities

### 🌍 Real-Time 3D Global Tracking
*   **WebGL Rendering**: GPU-accelerated massive rendering of hundreds of active orbital footprints without frame drops.
*   **Dual-Speed Animation Engine**: Toggle between "HyperSpeed" (6 seconds per revolution) and true "Real Time" (90 minutes per revolution) Newtonian orbital execution.
*   **Cinematic Target Lock**: Smooth camera fly-to animations when selecting specific items from the database.
*   **Dynamic Visual Filtration**: A Focus Mode that strips away visual clutter to isolate specific impending collision trajectories.

### 🔬 Analytical Tools
*   **Orbital Decay Predictor**: Implements standard aerospace heuristics using the object's Altitude and Ballistic Coefficient averages to mathematically estimate time until atmospheric burn-up (e.g., `< 1 Year (Critical)` to `> 1000 Years (Stable)`).
*   **Kinetic Energy Mapping**: Converts raw telemetry into real-world structural impact estimations ($E_k = \frac{1}{2}mv^2$) in MegaJoules (MJ).
*   **Live CelesTrak API**: A dual-pipeline backend that queries live internet GP APIs for space-track intelligence, featuring a seamless fallback to a local 9,600+ footprint dataset for offline analysis.

### 💥 Collision Machine Learning Engine
*   **XGBoost Prediction Matrix**: Cross-references intersecting objects to calculate Minimum Orbit Intersection Distance (MOID) and yield a physical crash percentage.
*   **Simulated Communications Uplink**: Fully interactive UI allowing operators to click `[ TRANSMIT AVOIDANCE MANEUVER ]` to visually simulate thruster uplinking and safe orbital clearance.
*   **Tracking Telemetry Stream**: A constant `[UTC]` streaming status banner routing live system hashes.

---

## 🚀 Quick Start (Local Setup)

The architecture is split between a Python/Flask API and a Node/React frontend.

### 1. Boot the Python Backend (Terminal 1)
```bash
cd backend
# Install required Data Science and API packages
pip install -r requirements.txt
# Start the Flask API
python app.py
```
*(The API will mount to http://localhost:5000)*

### 2. Boot the UI (Terminal 2)
```bash
cd frontend
# Install the React engine dependencies
npm install
# Boot via Vite
npm run dev
```
*(Runs on port 5173. Press `o` in your terminal to instantly launch the browser view).*

---

## ☁️ Cloud Deployment Configuration

This repository includes a decoupled architecture designed for immediate zero-config cloud deployments.

1. **Deploying the Backend (Render / Heroku / AWS):**
   *   The repository includes a `render.yaml` infrastructure file and a WSGI `Procfile`.
   *   Cloud Linux instances will automatically deploy the Flask server securely using the integrated `gunicorn app:app` command.
   
2. **Deploying the Frontend (Vercel / Netlify):**
   *   In your static hosting provider's Dashboard, simply create an Environment Variable named `VITE_API_URL` and set it to your new backend Cloud URL.
   *   The frontend will dynamically re-route all API calls to your cloud instance instance of `localhost`.

---

## 🏗️ Technology Stack

| Component | Technology | Role |
|-----------|-----------|---------|
| **Frontend UI** | React + Vite | Lightning-fast HMR and Component State execution |
| **3D Rendering** | react-globe.gl (Three.js) | High-performance WebGL coordinate plotting |
| **API Backend** | Python Flask | Lightweight routing and REST endpoints |
| **Data Analytics**| Pandas, NumPy | Heavy DataFrame matrix manipulation |
| **Server** | Gunicorn | WSGI threading for Cloud/Linux deployments |

## 🧬 Data Science Foundation

For researchers interested in the methodology powering the orbital proxies, please review `finalcode.ipynb` located in the root directory. It implements the core LSTM (Long Short-Term Memory) network architectures for orbital extrapolation and the XGBoost classifiers required for training collision heuristic weighting.

---

> *"Space isn't empty. It's getting crowded. Track it, predict it, and learn from it."*
