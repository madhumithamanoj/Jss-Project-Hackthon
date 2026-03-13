import torch
import torch.nn as nn
import torch.optim as optim

class VAE(nn.Module):
    def __init__(self, input_dim=5):
        super(VAE, self).__init__()
        self.fc1 = nn.Linear(input_dim, 16)
        self.fc2_mu = nn.Linear(16, 4)
        self.fc2_logvar = nn.Linear(16, 4)
        
        self.fc3 = nn.Linear(4, 16)
        self.fc4 = nn.Linear(16, input_dim)

    def encode(self, x):
        h1 = torch.relu(self.fc1(x))
        return self.fc2_mu(h1), self.fc2_logvar(h1)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5*logvar)
        eps = torch.randn_like(std)
        return mu + eps*std

    def decode(self, z):
        h3 = torch.relu(self.fc3(z))
        return self.fc4(h3)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar

# Global instance for demo
vae_model = VAE()
vae_model.eval()

def compute_anomaly_score(features):
    x = torch.tensor(features, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        recon_x, mu, logvar = vae_model(x)
        loss = nn.functional.mse_loss(recon_x, x).item()
    return loss * 100.0  # scale up for easier readability
