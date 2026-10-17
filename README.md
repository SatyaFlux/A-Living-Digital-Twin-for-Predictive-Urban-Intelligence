# AI-CityTwin

> **Tagline:** Observe. Predict. Simulate. Decide.  
> **Official Research Title:** *“AI-CityTwin: An AI-Powered Digital Twin Framework for Predictive Urban Intelligence and What-If Decision Simulation”*

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20WebGL-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

**AI-CityTwin** is a comprehensive, production-grade Artificial Intelligence and Digital Twin platform engineered for municipal authorities, smart campus operators, and urban mobility researchers. 

Unlike traditional static dashboards or basic CRUD monitors, AI-CityTwin unifies **real-time spatial digital twin telemetry**, **multi-horizon machine learning forecasting**, a **physics-constrained What-If simulation engine**, a **Pareto multi-objective genetic optimizer**, an **anonymous computer vision stream processor**, and a **strictly grounded RAG conversational assistant (TwinAI)**.

---

## 2. Problem Statement

Modern metropolitan and smart campus environments suffer from fragmented, reactive operations:
- **Telemetry Silos:** Traffic, air quality, energy grid, and hydraulic systems operate in disjointed databases without unified spatial awareness.
- **Lack of Multi-Horizon Proactivity:** Standard monitoring systems report what is happening *now*, but fail to forecast congestion, pollution spikes, or grid peak loads 15m to 2 hours into the future.
- **Inability to Test What-If Interventions:** Operators cannot predict the cascading network consequences of closing a road, adding EV fast-chargers, or rerouting public transit before actually committing real-world changes.
- **Hallucinating AI Interfaces:** Generic chatbots hallucinate numerical statistics when queried about city operations.

AI-CityTwin solves these challenges through an end-to-end mathematical and AI framework:
$$\text{Observe} \longrightarrow \text{Predict} \longrightarrow \text{Simulate} \longrightarrow \text{Decide}$$

---

## 3. System Architecture

```
                                  AI-CityTwin Architecture
                                  
+-----------------------------------------------------------------------------------------+
|                                    FRONTEND LAYER                                       |
|  React 18 + TypeScript + Tailwind CSS + Lucide Icons + Recharts + Three.js 3D Viewport  |
+-----------------------------------------------------------------------------------------+
                                             ▲
                                             │ REST APIs & WebSockets
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                  FASTAPI API GATEWAY                                    |
|  • JWT Role-Based Access Control (Admin, Analyst, Viewer)                               |
|  • REST Routers: /traffic, /air-quality, /energy, /water, /scenarios, /ai, /reports     |
|  • WebSockets Telemetry Synchronization Service (5-second reactive tick)               |
+-----------------------------------------------------------------------------------------+
                                             ▲
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
+------------------------------------------+   +------------------------------------------+
|         AI & PREDICTIVE ML CORE          |   |       SIMULATION & OPTIMIZATION CORE     |
| • Gradient Boosting & Random Forests     |   | • BPR Capacity-Delay Network Engine      |
| • Sequence Multi-Horizon Regressors      |   | • What-If Scenario Physics Simulator     |
| • Isolation Forest Anomaly Diagnostics   |   | • Multi-Objective Genetic Pareto Solver  |
| • SHAP Feature Attribution Factors       |   | • Grounded TwinAI Vector RAG Engine      |
+------------------------------------------+   +------------------------------------------+
                       ▲                                           ▲
                       └─────────────────────┬─────────────────────┘
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                DATABASE & STORAGE LAYER                                 |
|  SQLAlchemy Async ORM • PostgreSQL / SQLite Fallback • 18 Relational Schemas            |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Key Platform Features

### 4.1. Spatial Digital Twin Viewport (2D GIS + 3D WebGL)
- Seamless dual-mode switching between **2D GIS Layer View** (interactive SVG corridor vectors, pollution dispersion rings, facility heatmaps) and **3D WebGL Digital Twin** (Three.js building extrusions, road geometry tubes, and atmospheric particulate haze).
- Centralized color theme standard:
  - **Optimal:** Emerald (`#10b981`)
  - **Moderate / Warning:** Amber (`#f59e0b`)
  - **Critical / Severe:** Rose (`#ef4444`)

### 4.2. Traffic Intelligence & Multi-Horizon Forecast
- Inputs: Vehicle count, average velocity, road capacity, time-of-day, day-of-week, ambient temperature, precipitation, and special events.
- Outputs: Multi-step forecasts for **+15m, +30m, +60m, and +2h** with 95% confidence intervals and SHAP attribution importance weights.

### 4.3. Multi-Pollutant Air Quality & Dispersion
- Micro-sensor telemetry for **PM2.5, PM10, NO₂, CO, SO₂, and O₃** against EPA ambient standard limits.

### 4.4. Smart Building Energy & Thermal Anomaly Detection
- Sub-metered facility load profiles, peak demand kW tracking, and **Isolation Forest** anomaly detection diagnosing HVAC cooling ramps and compute spikes.

### 4.5. Hydraulic Infrastructure & Water Grid Intelligence
- Flow rate ($L/s$), tank reservoir percentages, and acoustic pressure loss ($bar$) leak detection.

### 4.6. What-If Scenario Simulation Engine
- **Scenario A:** Road Closure & Bypass Corridor Diversion (predicts queue spillover and travel time deltas).
- **Scenario B:** +25% EV Charging Infrastructure Expansion (models peak substation transformer demand vs queue wait times).
- **Scenario C:** Public Transit Frequency & Fare Subsidy Boost (models elastic modal shift and carbon abatement).
- **Scenario D:** Extreme Cloudburst & Flood Inundation (predicts culvert saturation and road impassability).
- **Strict Layer Segregation:** Output data is strictly segregated into **Observed**, **Predicted**, and **Simulated** data layers.

### 4.7. Multi-Objective Decision Optimizer
- Genetic Algorithm / Pareto Constraint Solver that ranks actionable urban interventions balancing:
  - Minimize Traffic Congestion
  - Minimize Grid Peak Load / Carbon Emissions
  - Minimize Emergency Response Latency
  - Minimize Implementation Complexity

### 4.8. Grounded Conversational Copilot (TwinAI)
- Context-aware RAG copilot grounded directly in live digital twin telemetry and indexed urban SOP documents.
- Strictly anti-hallucinatory: if telemetry is unavailable, it explicitly reports *"I don't have enough data to determine that."*

### 4.9. Anonymous Edge Computer Vision
- Video stream processor outputting normalized bounding boxes, vehicle classifications, speeds, and crowd densities with **zero biometric / facial indexing**.

---

## 5. Machine Learning Models & Evaluation Metrics

All models are trained and evaluated on 80/20 train/test splits. True calculated metrics from `ml/trained_models/model_registry.json`:

| Model / Domain | Algorithm | MAE | RMSE | MAPE (%) | $R^2$ Score | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Traffic Forecast** | Gradient Boosting (XGBoost) | **1.912** | **2.581** | **4.63%** | **0.9761** | **Active Champion** |
| **Traffic Candidate** | Random Forest (100 Trees) | 2.541 | 3.396 | 6.24% | 0.9587 | Candidate |
| **Traffic Baseline** | Linear Regression | 6.840 | 8.120 | 14.50% | 0.7420 | Baseline |
| **Air Quality (AQI)** | Gradient Boosting Regressor | **4.993** | **6.256** | **6.81%** | **0.8298** | **Active** |
| **Building Energy** | Random Forest Regressor | **2.562** | **3.269** | **4.12%** | **0.9878** | **Active** |
| **Anomaly Detection** | Isolation Forest ($c=0.03$) | — | — | — | — | **Active** |

---

## 6. Installation & Quickstart

### Prerequisites
- **Python 3.10+** (Tested on Python 3.11 / 3.14)
- **Node.js 18+** & **npm 9+**

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/AI-CityTwin.git
cd AI-CityTwin
```

### Step 2: Install Backend Dependencies & Train ML Models
```bash
python -m pip install -r backend/requirements.txt email-validator
python ml/pipelines/train_models.py
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Launch Applications

#### Windows (One-Click Launcher)
Double-click `scripts/start_dev.bat` or run:
```powershell
npm run dev
```

#### Manual Dual-Terminal Launch
**Terminal 1 (FastAPI Backend):**
```bash
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

**Terminal 2 (React Frontend):**
```bash
cd frontend
npm run dev
```
- Frontend Web App: [http://localhost:5173](http://localhost:5173)

---

## 7. Automated Testing Suite

Run the full automated test suite covering REST APIs, JWT authentication, scenario mathematics, ML predictions, and grounded RAG:

```bash
pytest tests/ -v
```

Output:
```
tests/test_backend_api.py::test_health_endpoint PASSED                   [  7%]
tests/test_backend_api.py::test_auth_login_admin PASSED                  [ 15%]
tests/test_backend_api.py::test_dashboard_overview PASSED                [ 23%]
tests/test_backend_api.py::test_digital_twin_state PASSED                [ 30%]
tests/test_backend_api.py::test_traffic_prediction PASSED                [ 38%]
tests/test_backend_api.py::test_what_if_simulation_road_closure PASSED   [ 46%]
tests/test_backend_api.py::test_optimization_solver PASSED               [ 53%]
tests/test_backend_api.py::test_twin_ai_chat_grounded PASSED             [ 61%]
tests/test_scenario_engine.py::test_road_closure_simulation PASSED       [ 69%]
tests/test_scenario_engine.py::test_ev_surge_simulation PASSED           [ 76%]
tests/test_scenario_engine.py::test_transit_boost_simulation PASSED      [ 84%]
tests/test_scenario_engine.py::test_extreme_weather_simulation PASSED    [ 92%]
tests/test_scenario_engine.py::test_optimization_solver_pareto PASSED    [100%]

======================= 13 passed in 2.60s =======================
```

---

## 8. Development & Local Run

Run the unified local stack or start services individually:

```bash
# Windows
.\scripts\start_dev.bat

# Linux / macOS
bash ./scripts/start_dev.sh
```

Or run services separately:
```bash
# Backend (FastAPI on Port 8000)
python -m uvicorn app.main:app --app-dir backend --reload --port 8000

# Frontend (Vite on Port 5173)
npm run dev --prefix frontend
```
- Access Frontend on `http://localhost:5173`
- Access Backend API & Docs on `http://localhost:8000/docs`

---

## 9. Role-Based Access Control (RBAC) Demo Credentials

The platform includes pre-configured demo profiles in the top navigation bar:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@citytwin.ai` | `admin123` | Full access, scenario configuration, system health |
| **Analyst** | `analyst@citytwin.ai` | `analyst123` | Run simulations, compare ML models, export audit reports |
| **Viewer** | `viewer@citytwin.ai` | `viewer123` | View dashboard KPIs, explore maps, chat with TwinAI |

---

## 10. Privacy & Scientific Ethics Statement

AI-CityTwin was engineered with strict adherence to privacy-by-design:
1. **No Facial Recognition:** Computer vision uses anonymous object bounding boxes.
2. **Zero PII Retention:** No personal identification data or license plates are processed or stored.
3. **Transparent Simulation Disclosure:** All synthetic and simulated data layers are explicitly badged as **"Demo / Simulated Data"** in both UI overlays and API response payloads.

---

## 11. License & Citation

Distributed under the MIT License. See `LICENSE` for details.

If you reference this project in academic publications or research prototypes, please cite:

```bibtex
@article{aicitytwin2026,
  title={AI-CityTwin: An AI-Powered Digital Twin Framework for Predictive Urban Intelligence and What-If Decision Simulation},
  author={AI-CityTwin Research Team},
  year={2026}
}
```
Design by Satya Ram 
