
import torch
import torch.nn as nn
import torch.onnx

class SimpleSpeakerEncoder(nn.Module):
    def __init__(self, input_dim=16000*3, embedding_dim=128):
        super(SimpleSpeakerEncoder, self).__init__()
        self.features = nn.Sequential(
            nn.Conv1d(1, 32, kernel_size=80, stride=4, padding=38),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(4),
            
            nn.Conv1d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(4),
            
            nn.Conv1d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        self.fc = nn.Linear(128, embedding_dim)
        
        torch.manual_seed(42)

    def forward(self, x):
        x = x.unsqueeze(1)
        x = self.features(x)
        x = x.squeeze(2)
        x = self.fc(x)
        x = torch.nn.functional.normalize(x, p=2, dim=1)
        return x

def export_onnx():
    print("Creating SimpleSpeakerEncoder...")
    model = SimpleSpeakerEncoder()
    model.eval()

    duration_sec = 4
    sample_rate = 16000
    dummy_input = torch.randn(1, duration_sec * sample_rate)

    output_path = "public/models/speaker_encoder.onnx"
    
    print(f"Exporting to {output_path}...")
    torch.onnx.export(
        model, 
        dummy_input, 
        output_path, 
        input_names=["input"], 
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size", 1: "sequence_length"},
            "output": {0: "batch_size"}
        },
        opset_version=12
    )
    print("Done! Valid random-projection ONNX model created.")

if __name__ == "__main__":
    export_onnx()
