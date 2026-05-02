import os
import csv
import shutil
import random

# Setup paths
data_dir = "data"
train_images_dir = os.path.join(data_dir, "training_images")
csv_path = os.path.join(data_dir, "train_solution_bounding_boxes (1).csv")

dataset_dir = "dataset"
images_train = os.path.join(dataset_dir, "images", "train")
images_val = os.path.join(dataset_dir, "images", "val")
labels_train = os.path.join(dataset_dir, "labels", "train")
labels_val = os.path.join(dataset_dir, "labels", "val")

# Image dimensions
IMG_WIDTH = 676.0
IMG_HEIGHT = 380.0

def create_dirs():
    for d in [images_train, images_val, labels_train, labels_val]:
        os.makedirs(d, exist_ok=True)

def read_boxes():
    boxes = {}
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        next(reader) # skip header
        for row in reader:
            img_name = row[0]
            xmin = float(row[1])
            ymin = float(row[2])
            xmax = float(row[3])
            ymax = float(row[4])
            
            x_center = (xmin + xmax) / 2.0 / IMG_WIDTH
            y_center = (ymin + ymax) / 2.0 / IMG_HEIGHT
            width = (xmax - xmin) / IMG_WIDTH
            height = (ymax - ymin) / IMG_HEIGHT
            
            if img_name not in boxes:
                boxes[img_name] = []
            boxes[img_name].append(f"0 {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
    return boxes

def prepare_data():
    create_dirs()
    boxes = read_boxes()
    
    # Get all images
    all_images = [f for f in os.listdir(train_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    random.seed(42)
    random.shuffle(all_images)
    
    split_idx = int(len(all_images) * 0.8)
    train_imgs = all_images[:split_idx]
    val_imgs = all_images[split_idx:]
    
    def process_split(imgs, split_name, img_out_dir, label_out_dir):
        print(f"Processing {split_name} split ({len(imgs)} images)...")
        for img in imgs:
            # Copy image
            src_img = os.path.join(train_images_dir, img)
            dst_img = os.path.join(img_out_dir, img)
            shutil.copy2(src_img, dst_img)
            
            # Write label if exists
            if img in boxes:
                label_path = os.path.join(label_out_dir, img.rsplit('.', 1)[0] + '.txt')
                with open(label_path, 'w') as f:
                    f.write('\n'.join(boxes[img]))

    process_split(train_imgs, "train", images_train, labels_train)
    process_split(val_imgs, "val", images_val, labels_val)
    
    # Create dataset.yaml
    yaml_content = f"""train: {os.path.abspath(images_train)}
val: {os.path.abspath(images_val)}

names:
  0: car
"""
    with open("dataset.yaml", "w") as f:
        f.write(yaml_content)
        
    print("YOLO dataset preparation complete. dataset.yaml created.")

if __name__ == "__main__":
    prepare_data()
