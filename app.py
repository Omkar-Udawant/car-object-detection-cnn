import os
import io
import cv2
import base64
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from ultralytics import YOLO

app = FastAPI(title="Car Object Detection YOLOv8")

# Mount static and template directories
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Model configuration
MODEL_PATH = "yolov8s.pt"
model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        # Load the base COCO pretrained YOLOv8n model
        model = YOLO(MODEL_PATH)
        print(f"YOLOv8 model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if model is None:
        return JSONResponse(status_code=500, content={"error": "Model not loaded. Please train the model first."})
    
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image file."})
            
        # Run YOLO inference with optimal parameters for full car detection
        # conf=0.5: Minimum confidence threshold to filter out low quality detections
        # iou=0.45: Intersection over Union threshold for Non-Maximum Suppression (merges overlapping boxes)
        # agnostic_nms=True: Merges overlapping boxes regardless of class
        # classes=[2, 5, 7]: Only detect cars(2), buses(5), and trucks(7) from COCO dataset
        results = model.predict(img, conf=0.5, iou=0.45, agnostic_nms=True, classes=[2, 5, 7])
        result = results[0]
        
        cars_detected = len(result.boxes)
        boxes_data = []
        confidence_scores = []
        
        for box in result.boxes:
            boxes_data.append(box.xyxy[0].tolist())
            confidence_scores.append(float(box.conf[0]))
            
        # Get annotated image
        annotated_img = result.plot()
        
        # Convert to base64 for frontend
        _, buffer = cv2.imencode('.jpg', annotated_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "cars_detected": cars_detected,
            "boxes": boxes_data,
            "confidence_scores": confidence_scores,
            "annotated_image_base64": img_base64
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)
