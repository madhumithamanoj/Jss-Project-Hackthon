# Aegis-MUD IoT Trust & Drift Analytics Platform

A complete working demo project for a student cybersecurity hackathon.

This software-only system monitors simulated IoT network telemetry, detects policy drift using a Variational Autoencoder (VAE), computes a dynamic trust score, and provides explainable security evidence in a modern SOC-style dashboard.

## Project Structure

- `backend/`: FastAPI backend orchestration
- `ml/`: PyTorch VAE model, Drift Detector (Page-Hinkley & KL divergence), Trust Engine, and Explainability Engine
- `simulator/`: Telemetry generator that synthesizes normal and attack IoT traffic
- `frontend/`: React + TailwindCSS dashboard

## Getting Started

### 1. Backend Setup

```bash
cd aegis-mud
cd backend

# (Optional) Create a virtual environment
# python -m venv venv
# source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload
```

### 2. Frontend Setup

In a new terminal:

```bash
cd aegis-mud
cd frontend

# Install dependencies
npm install

# Start the React development server
npm run dev
```

## Features

- **Normal IoT Behavior**: Baseline telemetry for devices.
- **Attack Simulation**: Click "Simulate Attack" to introduce data exfiltration/DNS tunneling behavior to devices.
- **Trust Score Engine**: Real-time evaluation of device behavior mapped to risk levels.
- **Explainable Evidence**: Direct insights into what changed (e.g., "Payload entropy increased").

## Example API Test

**Get telemetry history:**
```bash
curl http://localhost:8000/telemetry
```

**Get device state:**
```bash
curl http://localhost:8000/devices
```

**Toggle attack mode via API:**
```bash
curl -X POST http://localhost:8000/simulate_attack?enable=true
```
