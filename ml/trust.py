def compute_trust_score(anomaly_score, drift_severity, violations_count):
    score = 100.0
    
    # Penalty for anomaly score
    # Usually anomaly score is between 0 and a few hundreds, cap it for trust score
    penalty_anomaly = min(40.0, anomaly_score)
    score -= penalty_anomaly
    
    # Penalty for drift severity (drift_severity is 0.0, 0.5, or 1.0)
    score -= drift_severity * 30.0
    
    # Penalty for violations
    score -= violations_count * 10.0
    
    score = max(0.0, min(100.0, score))
    return int(score)

def get_risk_level(trust_score):
    if trust_score >= 80:
        return "Trusted"
    elif trust_score >= 60:
        return "Monitor"
    elif trust_score >= 40:
        return "Suspicious"
    else:
        return "High Risk"
