# 🚗 Car Object Detection AI

A beautiful, high-performance web application that uses **YOLOv8** and **FastAPI** to instantly detect cars in images and live webcam streams.

## ✨ Features
- **Live Webcam Tracking**: Point your camera at the street and watch the AI draw tracking boxes over vehicles in real-time right in your browser!
- **Image Upload**: Drag and drop images to analyze them.
- **High Accuracy**: Uses the `yolov8s` (Small) model for robust detection, perfectly tuned to filter out low-confidence fragments.
- **Blazing Fast**: Powered by an asynchronous FastAPI backend and optimized frontend Canvas rendering.
- **Modern UI**: A sleek, glassmorphism-inspired dark mode interface with dynamic animations.

## 🛠️ Tech Stack
- **Backend**: Python, FastAPI, Uvicorn
- **AI Model**: Ultralytics YOLOv8
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (WebRTC & Canvas)
- **Image Processing**: OpenCV, NumPy

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/car-object-detection-cnn.git
cd car-object-detection-cnn
```

### 2. Set up a virtual environment (Optional but recommended)
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the application
```bash
uvicorn app:app --reload
# or
python app.py
```
Open your browser and navigate to **http://127.0.0.1:5000**

*(Note: The first time you run the app, it will automatically download the `yolov8s.pt` model weights, which is ~22MB).*

## 🧠 Future Roadmap
- [ ] **Car Brand Detection**: Fine-tune the YOLOv8 model on a custom dataset to identify specific car brands like Tesla, Ford, and Toyota. (Training scripts `train_yolo.py` and `prepare_yolo_data.py` are included in the repo for this future endeavor).
- [ ] **License Plate Recognition (ALPR)**: Add a secondary model to read license plates.
- [ ] **Vehicle Counting**: Draw crossing lines to count traffic.

## 📝 License
This project is open-source and available under the MIT License.
