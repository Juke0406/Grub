from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained model
model = models.resnet50(pretrained=True)
model.eval()

# Image preprocessing
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Read image file
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    
    # Preprocess and predict
    input_tensor = preprocess(image)
    input_batch = input_tensor.unsqueeze(0)
    
    with torch.no_grad():
        output = model(input_batch)
    
    # Get predicted class
    probabilities = torch.nn.functional.softmax(output[0], dim=0)
    _, predicted_idx = torch.max(probabilities, 0)
    
    return {
        "category": "Furniture",  # TODO: Replace with actual prediction
        "description": "A comfortable chair",  # TODO: Replace with generated description
        "condition": "Good"  # TODO: Add condition analysis
    }

@app.post("/predict-price")
async def predict_price(item: dict):
    # TODO: Implement price prediction logic
    return {"price": 50.0}

@app.post("/generate-description")
async def generate_description(item: dict):
    # TODO: Implement description generation
    return {"description": "A high quality item in good condition"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
