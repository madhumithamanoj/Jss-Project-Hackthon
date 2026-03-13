def generate_evidence(telemetry):
    evidence = []
    
    if telemetry['payload_entropy'] > 5.0:
        evidence.append("Payload entropy increased")
    
    if telemetry['destination_ip_frequency'] > 5.0:
        evidence.append("New destination IP detected")
        
    if telemetry['dns_query_rate'] > 5.0:
        evidence.append("DNS query rate abnormal")
        
    if telemetry['packet_size'] > 500:
        evidence.append("Unusually large packet size")
        
    if telemetry['inter_arrival_time'] < 0.2:
        evidence.append("Suspiciously fast inter-arrival time")
    
    return evidence
