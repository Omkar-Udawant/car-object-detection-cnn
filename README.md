# 🚦 Intelligent Traffic Management System (ITMS)

A professional, high-performance web application tailored for law enforcement and traffic management. This application uses **YOLOv8** and **FastAPI** to analyze real-time traffic density, identify heavy vehicle volumes, and provide actionable, data-driven traffic management recommendations.

## ✨ Features
- **Traffic Density Analysis**: Instantly calculates congestion levels (CLEAR, LOW, MODERATE, HIGH) based on the number of vehicles detected in the frame.
- **Actionable Intelligence**: Generates automated suggestions for traffic officers, such as extending green lights, deploying manual regulation, or enforcing lane restrictions.
- **Heavy Vehicle Tracking**: Specifically monitors the volume of buses and trucks to provide targeted infrastructure recommendations.
- **High Accuracy**: Uses the `yolov8s` (Small) model for robust detection, perfectly tuned to filter out low-confidence fragments.
- **Blazing Fast**: Powered by an asynchronous FastAPI backend and optimized frontend rendering.
- **Modern Police Dashboard UI**: A sleek, glassmorphism-inspired dark mode interface with dynamic statistics and visual feedback.

## 🛠️ Tech Stack
- **Backend**: Python, FastAPI, Uvicorn
- **AI Model**: Ultralytics YOLOv8
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Image Processing**: OpenCV, NumPy

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/car-object-detection-cnn.git
cd car-object-detection-cnn
```

### 2. Set up a virtual environment (Recommended)
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
python app.py
```
Open your browser and navigate to **http://127.0.0.1:5000**

*(Note: The first time you run the app, it will automatically download the `yolov8s.pt` model weights, which is ~22MB).*

## 🧠 Future Roadmap
- [ ] **Live CCTV Integration**: Support RTSP streams from city traffic cameras for 24/7 continuous monitoring.
- [ ] **License Plate Recognition (ALPR)**: Add a secondary model to read license plates of speeding or offending vehicles.
- [ ] **Vehicle Counting Over Time**: Store historical traffic data to predict peak hours and suggest long-term infrastructure improvements.

## 📝 License
This project is open-source and available under the MIT License.
