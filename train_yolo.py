from ultralytics import YOLO

def train_model():
    print("Initializing YOLOv8n model...")
    model = YOLO("yolov8n.pt")  # load a pretrained model
    
    print("Starting training...")
    # Train the model
    results = model.train(
        data="dataset.yaml",
        epochs=50,
        imgsz=640,
        batch=16,
        project="runs",
        name="car_detection"
    )
    
    print("Training complete! Model saved to runs/car_detection/weights/best.pt")

if __name__ == '__main__':
    train_model()
