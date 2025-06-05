import torch
import torch.nn as nn
from torchvision.models import vit_b_16

class MobileRetinaViT(nn.Module):
    def __init__(self, num_classes):
        super(MobileRetinaViT, self).__init__()
        # Load pretrained ViT
        self.vit = vit_b_16(pretrained=True)
        
        # Replace the head with our custom classifier
        self.vit.heads = nn.Sequential(
            nn.Linear(768, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        return self.vit(x) 