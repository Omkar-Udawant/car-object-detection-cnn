import sys
from ultralytics import YOLO

def test_single_image(image_path):
    print(f"Loading model yolov8s.pt...")
    model = YOLO("yolov8s.pt")
    
    print(f"Testing on {image_path}...")
    
    results = model.predict(
        source=image_path,
        conf=0.5,
        iou=0.45,
        agnostic_nms=True,
        classes=[2, 5, 7], # car, bus, truck
        save=True,
        project="runs",
        name="test_isolated_car"
    )
    
    print("Testing complete. Results are saved in runs/test_isolated_car/")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_single_image(sys.argv[1])
    else:
        print("Please provide an image path.")
