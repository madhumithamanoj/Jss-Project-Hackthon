import random
import time

DEVICES = [f"DEVICE_{i:03d}" for i in range(1, 6)]

class TelemetrySimulator:
    def __init__(self):
        self.attack_mode = False

    def enable_attack_mode(self, enable: bool):
        self.attack_mode = enable

    def generate_telemetry(self):
        telemetry_data = []
        for device in DEVICES:
            # Baseline normal behavior
            packet_size = random.uniform(50, 200)
            payload_entropy = random.uniform(2.0, 4.0)
            dns_query_rate = random.uniform(0.1, 1.0)
            inter_arrival_time = random.uniform(0.5, 2.0)
            destination_ip_frequency = random.uniform(1, 5)

            # Attack mode adds malicious noise (Data Exfiltration / DNS Tunneling)
            # Typically attacks target a subset, but we'll apply it everywhere for demo visibility,
            # or specifically to one device to make it stand out.
            is_attack = self.attack_mode and (device in ["DEVICE_001", "DEVICE_003"])
            
            if is_attack:
                # Exfiltration -> high packet size, high destination IP freq
                if random.random() > 0.5:
                    packet_size = random.uniform(800, 1500)
                    destination_ip_frequency = random.uniform(10, 50)
                # DNS Tunneling -> high entropy, high dns rate
                else:
                    payload_entropy = random.uniform(6.0, 8.0)
                    dns_query_rate = random.uniform(10.0, 30.0)
                    inter_arrival_time = random.uniform(0.01, 0.1)
                
            data = {
                "device_id": device,
                "timestamp": time.time(),
                "packet_size": packet_size,
                "payload_entropy": payload_entropy,
                "dns_query_rate": dns_query_rate,
                "inter_arrival_time": inter_arrival_time,
                "destination_ip_frequency": destination_ip_frequency,
                "is_attack_simulated": is_attack
            }
            telemetry_data.append(data)
        
        return telemetry_data

simulator = TelemetrySimulator()
