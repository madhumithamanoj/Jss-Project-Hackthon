import numpy as np
from scipy.stats import entropy

class DriftDetector:
    def __init__(self, ph_threshold=5.0, min_instances=50):
        self.sum_val = 0.0
        self.n_instances = 0
        self.ph_sum = 0.0
        self.ph_threshold = ph_threshold
        self.min_instances = min_instances
        self.baseline_dist = []
        self.current_dist = []

    def update(self, anomaly_score):
        # Page-Hinkley
        self.n_instances += 1
        self.sum_val += anomaly_score
        mean = self.sum_val / self.n_instances
        
        self.ph_sum = max(0.0, self.ph_sum + (anomaly_score - mean - 0.01))
        
        ph_drift = self.ph_sum > self.ph_threshold and self.n_instances > self.min_instances
        
        # Distribution
        if len(self.baseline_dist) < 100:
            self.baseline_dist.append(anomaly_score)
        
        self.current_dist.append(anomaly_score)
        if len(self.current_dist) > 100:
            self.current_dist.pop(0)

        # KL Divergence
        kl_drift_val = 0.0
        if len(self.baseline_dist) >= 50 and len(self.current_dist) >= 50:
            hist_base, _ = np.histogram(self.baseline_dist, bins=10, density=True)
            hist_curr, _ = np.histogram(self.current_dist, bins=10, density=True)
            
            hist_base = hist_base + 1e-10
            hist_curr = hist_curr + 1e-10
            
            kl_drift_val = float(entropy(hist_curr, hist_base))
            
        drift_severity = 0.0
        if ph_drift:
            drift_severity += 0.5
        if kl_drift_val > 1.0:
            drift_severity += 0.5
            
        return drift_severity, kl_drift_val, ph_drift
