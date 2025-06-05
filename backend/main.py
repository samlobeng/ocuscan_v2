from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import pandas as pd
import numpy as np
import cv2
from vit_retina import MobileRetinaViT

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load disease columns from CSV
df = pd.read_csv('Model/train_data.csv')
disease_columns = [col for col in df.columns if col != 'ID']

# Create model instance
model = MobileRetinaViT(num_classes=len(disease_columns))
model = model.to(device)

# Load the model checkpoint
try:
    checkpoint = torch.load('Model/mobile_retina_vit.pt', map_location=device)
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        # If the checkpoint is the state dict directly
        model.load_state_dict(checkpoint)
    model.eval()
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise HTTPException(status_code=500, detail="Failed to load model")

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def is_retina_image(image):
    """
    Validate if the image is a retina image using color and shape analysis
    """
    # Convert PIL Image to OpenCV format
    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Find circles (retina typically has a circular shape)
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=50,
        param1=50,
        param2=30,
        minRadius=100,
        maxRadius=300
    )
    
    # Check if we found a circle
    has_circle = circles is not None and len(circles) > 0
    
    # Analyze color distribution
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Define color ranges for retina (reddish and yellowish tones)
    lower_red = np.array([0, 50, 50])
    upper_red = np.array([10, 255, 255])
    lower_yellow = np.array([20, 50, 50])
    upper_yellow = np.array([30, 255, 255])
    
    # Create masks for red and yellow regions
    mask_red = cv2.inRange(hsv, lower_red, upper_red)
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
    
    # Calculate percentage of red and yellow pixels
    total_pixels = img.shape[0] * img.shape[1]
    red_percentage = (np.sum(mask_red) / 255) / total_pixels * 100
    yellow_percentage = (np.sum(mask_yellow) / 255) / total_pixels * 100
    
    # Check if the image has typical retina colors
    has_retina_colors = (red_percentage > 5) or (yellow_percentage > 5)
    
    return has_circle and has_retina_colors

def predict_image(image):
    """
    Predict diseases for a single image.
    
    Args:
        image: PIL Image object
    
    Returns:
        Dictionary of disease predictions with probabilities
    """
    try:
        # Convert image to RGB
        image = image.convert('RGB')
        # Apply transformations
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            # Apply sigmoid to get probabilities between 0 and 1
            probabilities = torch.sigmoid(outputs).cpu().numpy()[0]
        
        # Create dictionary of predictions
        predictions = {}
        for disease, prob in zip(disease_columns, probabilities):
            predictions[disease] = {
                'probability': float(prob),
                'detected': prob > 0.5
            }
        
        return predictions
    
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Validate if it's a retina image
        if not is_retina_image(image):
            raise HTTPException(
                status_code=400, 
                detail="This image does not appear to be a retina image. Please upload a valid retina image."
            )
        
        # Get predictions
        predictions = predict_image(image)
        
        if predictions is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to process the image. Please try again."
            )
        
        return predictions

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 