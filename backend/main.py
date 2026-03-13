from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import asyncio
import sys
import os

# Adjust path to import ml and simulator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simulator.generator import simulator, DEVICES
from ml.vae_model import compute_anomaly_score
from ml.drift import DriftDetector
from ml.trust import compute_trust_score, get_risk_level
from ml.explain import generate_evidence

app = FastAPI(title="Aegis-MUD Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
devices_state = {dev: {"trust_score": 100, "risk_level": "Trusted", "evidence": [], "alerts": [], "drift_severity": 0.0, "anomaly_score": 0.0, "is_attack": False} for dev in DEVICES}
drift_detectors = {dev: DriftDetector() for dev in DEVICES}
telemetry_history = []

def process_telemetry():
    data = simulator.generate_telemetry()
    for t in data:
        dev_id = t["device_id"]
        features = [t["packet_size"], t["payload_entropy"], t["dns_query_rate"], t["inter_arrival_time"], t["destination_ip_frequency"]]
        
        # 1. Anomaly Score
        anomaly_score = compute_anomaly_score(features)
        
        # 2. Drift Detection
        drift_severity, kl_drift, ph_drift = drift_detectors[dev_id].update(anomaly_score)
        
        # 3. Policy violations / Evidence
        evidence = generate_evidence(t)
        violations_count = len(evidence)
        
        if ph_drift:
            evidence.append("Distribution Drift Detected (Page-Hinkley)")
        if kl_drift > 1.0:
            evidence.append("Behavioral Distribution Shift (KL Divergence)")
            
        # 4. Trust Score
        t_score = compute_trust_score(anomaly_score, drift_severity, violations_count)
        r_level = get_risk_level(t_score)
        
        # Update state
        devices_state[dev_id] = {
            "trust_score": t_score,
            "risk_level": r_level,
            "evidence": evidence,
            "drift_severity": drift_severity,
            "anomaly_score": anomaly_score,
            "is_attack": t["is_attack_simulated"]
        }
        
        # History limits
        t_hist = {**t, "trust_score": t_score, "anomaly_score": anomaly_score}
        telemetry_history.append(t_hist)
        
    if len(telemetry_history) > 500:
        del telemetry_history[:100]

async def background_telemetry():
    while True:
        process_telemetry()
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_telemetry())

@app.post("/simulate_attack")
async def simulate_attack(enable: bool):
    simulator.enable_attack_mode(enable)
    return {"attack_mode": enable}

@app.get("/telemetry")
async def get_telemetry():
    return {"history": telemetry_history[-50:]}

@app.get("/devices")
async def get_devices():
    return devices_state

@app.get("/trust-score/{device_id}")
async def get_trust_score(device_id: str):
    if device_id in devices_state:
        return devices_state[device_id]
    return {"error": "Device not found"}

@app.get("/alerts")
async def get_alerts():
    alerts = []
    for dev, state in devices_state.items():
        if state["trust_score"] < 60:
            alerts.append({"device_id": dev, "risk_level": state["risk_level"], "evidence": state["evidence"]})
    return {"alerts": alerts}

