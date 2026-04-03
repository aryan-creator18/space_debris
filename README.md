# 🛰️ Space Debris Analysis & Prediction Dashboard (Vibe Coding Edition)

An ultra-modern, high-performance WebGL dashboard for tracking, modeling, and analyzing Low Earth Orbit (LEO) satellite trajectories and collision probabilities. Built for aerospace hackathons, this platform combines hard Data Science (pandas, XGBoost-ready ML integration, Keplerian Physics) with a breathtaking React `globe.gl` cinematic UI.

![Dashboard Preview](https://img.shields.io/badge/Status-Hackathon_Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-Live_HMR-purple)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Render-black)

## 🌟 Core Features

### 🌍 Cinematic 3D Global Tracking
*   **WebGL React Globe**: GPU-accelerated massive rendering of hundreds of active tracking nodes without frame drops.
*   **Dual-Speed Animation Engine**: Toggle between "HyperSpeed" (6 seconds per revolution) and "Real Time" (90 minutes per revolution) Newtonian scaling.
*   **Focus Target Lock**: Instant, smooth cinematic camera fly-to animations when selecting a specific tracking footprint.
*   **Dynamic UI Filtration**: Clutter-clearing Focus Mode to visually isolate specific impending collision trajectories.

### 🔬 Hard Aerospace Analytics
*   **Orbital Decay Predictor**: Calculates Ballistic Coefficient averages across live Altitude to forecast atmospheric burn-up (e.g., `< 1 Year (Critical)` to `> 1000 Years (Stable)`).
*   **Kinetic Energy Math**: Converts standard velocity telemetry into real-world structural impact force ($E_k = \frac{1}{2}mv^2$) in MegaJoules (MJ).
*   **Live CelesTrak Fetching**: Dual-pipeline backend that queries live GP APIs for space-track intelligence, with an instant 9,669-item Local CSV Data Science Fallback to prevent network failure during live pitches.

### 💥 Collision ML Assessment Panel
*   **XGBoost Probability Vectors**: Cross-reference any two intersecting objects to calculate Minimum Orbit Intersection Distance (MOID) and yield a physical crash percentage.
*   **Simulated Evasion Link**: Fully interactive UI allowing operators to click `[ TRANSMIT AVOIDANCE MANEUVER ]` to visually simulate thruster uplinking and orbital clearance.
*   **Continuous Telemetry Stream**: A hacker-style `[UTC]` streaming banner routing simulated tracking hashes at the footer of the command center.

---

## 🚀 Quick Start (Local Presentation)

For live Hackathon pitches, we **strongly recommend running this locally** to ensure 0-millisecond latency when loading the large CSV datasets into pandas.

### 1. Boot the Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*(Runs on port 5000)*

### 2. Boot the Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*(Runs on port 5173. Press `o` to instantly open in your browser)*

---

## ☁️ Cloud Deployment (Vercel & Render)

This repository has been decoupled and configured for immediate zero-config cloud deployment.

1. **Backend (Render / Railway / Heroku):**
   *   The repository includes a `render.yaml` infrastructure file and a WSGI `Procfile`.
   *   Connect your GitHub repo to Render, select the `backend` folder, and it will automatically deploy the Flask server using `gunicorn app:app`.
   
2. **Frontend (Vercel / Netlify):**
   *   Connect the `frontend` directory to Vercel. 
   *   In your Vercel Dashboard, create an Environment Variable: `VITE_API_URL` and set it to your new Render Cloud URL.
   *   Vercel will dynamically re-route all Axios calls from `localhost` to the live cloud!

---

## 🏗️ Tech Stack

| Component | Technology | Role |
|-----------|-----------|---------|
| **Frontend UI** | React + Vite | Lightning-fast HMR and Component State execution |
| **3D Rendering** | react-globe.gl (Three.js) | High-performance Canvas/WebGL plotting |
| **API Backend** | Python Flask | Lightweight routing and REST endpoints |
| **Data Science**| Pandas, NumPy | Heavy DataFrame matrix manipulation and CSV loading |
| **Production** | Gunicorn | WSGI threading for Cloud/Linux deployments |

## 🧬 Machine Learning Pipeline

Check out `finalcode.ipynb` located in the root repository to review the raw underlying data-science approach that powers this visual dashboard. It implements both LSTM (Long Short-Term Memory) network architectures for orbital extrapolation and XGBoost classifiers for collision heuristic weighting.

---

> *"Space isn't empty. It's getting crowded. Track it, predict it, and clean it up."*
