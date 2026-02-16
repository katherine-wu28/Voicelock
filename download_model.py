#!/usr/bin/env python3

import os
from huggingface_hub import hf_hub_download

MODEL_REPO = "deepghs/pyannote-embedding-onnx"
MODEL_FILENAME = "model.onnx"
OUTPUT_DIR = "public/models"
OUTPUT_FILENAME = "pyannote_embedding.onnx"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    
    print(f"Downloading {MODEL_REPO}/{MODEL_FILENAME}...")
    
    downloaded_path = hf_hub_download(
        repo_id=MODEL_REPO,
        filename=MODEL_FILENAME,
        local_dir=OUTPUT_DIR,
        local_dir_use_symlinks=False
    )
    
    if downloaded_path != output_path:
        actual_downloaded = os.path.join(OUTPUT_DIR, MODEL_FILENAME)
        if os.path.exists(actual_downloaded):
            os.rename(actual_downloaded, output_path)
            print(f"Renamed to {output_path}")
    
    print(f"✓ Model downloaded successfully to {output_path}")
    print(f"  File size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
