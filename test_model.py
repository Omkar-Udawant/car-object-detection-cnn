import os
import glob
from ultralytics import YOLO

def test_model():
    print("Loading model yolov8s.pt...")
    model = YOLO("yolov8s.pt")
    
    val_images_dir = "dataset/images/val"
    val_images = glob.glob(os.path.join(val_images_dir, "*.jpg"))
    
    if not val_images:
        print(f"No images found in {val_images_dir}")
        return

    # Select a few images to test
    test_images = val_images[:25]
    print(f"Testing on {len(test_images)} images...")
    
    # Run prediction and save the annotated images
    results = model.predict(
        source=test_images,
        conf=0.5,
        iou=0.45,
        agnostic_nms=True,
        classes=[2, 5, 7], # car, bus, truck
        save=True,
        project="runs",
        name="test_results"
    )
    
    print("Testing complete. Results are saved in runs/test_results/")

if __name__ == "__main__":
    test_model()
