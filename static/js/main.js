document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const predictBtn = document.getElementById('predict-btn');
    const uploadForm = document.getElementById('upload-form');
    const scanner = document.getElementById('scanner');
    const loadingText = document.getElementById('loading-text');
    
    const resultContainer = document.getElementById('result-container');
    const resultTitle = document.getElementById('result-title');
    const probPercentText = document.getElementById('prob-percent');
    const progressFill = document.getElementById('progress-fill');

    let currentFile = null;

    // Click to upload
    dropArea.addEventListener('click', () => {
        if(!currentFile) fileInput.click();
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });

    dropArea.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                currentFile = file;
                
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    dropArea.style.display = 'none';
                    previewContainer.style.display = 'block';
                    predictBtn.disabled = false;
                    
                    // Reset UI
                    resultContainer.style.display = 'none';
                    scanner.style.display = 'none';
                    progressFill.style.width = '0%';
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a valid image file.");
            }
        }
    }

    // Remove selected image
    removeBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '#';
        dropArea.style.display = 'block';
        previewContainer.style.display = 'none';
        predictBtn.disabled = true;
        resultContainer.style.display = 'none';
        scanner.style.display = 'none';
        progressFill.style.width = '0%';
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentFile) return;

        const formData = new FormData();
        formData.append('file', currentFile);

        // UI Updates for Loading State
        predictBtn.disabled = true;
        predictBtn.textContent = 'Processing...';
        scanner.style.display = 'block'; // Start scanning animation
        loadingText.style.display = 'block';
        resultContainer.style.display = 'none';
        progressFill.style.width = '0%';

        try {
            const response = await fetch('/detect', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update preview image with YOLO annotated image
                imagePreview.src = `data:image/jpeg;base64,${data.annotated_image_base64}`;
                
                if (data.cars_detected > 0) {
                    resultTitle.textContent = `${data.cars_detected} Car(s) Detected`;
                    resultContainer.className = 'result-container success';
                    
                    // Show max confidence
                    const maxConf = Math.max(...data.confidence_scores);
                    const percent = (maxConf * 100).toFixed(1);
                    probPercentText.textContent = `${percent}% (Max Conf)`;
                    setTimeout(() => { progressFill.style.width = `${percent}%`; }, 100);
                } else {
                    resultTitle.textContent = "No Cars Detected";
                    resultContainer.className = 'result-container error';
                    probPercentText.textContent = "N/A";
                    setTimeout(() => { progressFill.style.width = `0%`; }, 100);
                }
            } else {
                showError(data.error || "An unknown error occurred.");
            }
        } catch (error) {
            showError("Failed to connect to the server.");
        } finally {
            scanner.style.display = 'none';
            loadingText.style.display = 'none';
            predictBtn.disabled = false;
            predictBtn.textContent = 'Detect Car';
            resultContainer.style.display = 'block';
        }
    });

    function showError(msg) {
        resultTitle.textContent = "Error";
        probPercentText.textContent = "0%";
        progressFill.style.width = "0%";
        resultContainer.className = 'result-container error';
        alert(msg);
    }

    // --- Webcam & Mode Toggle Logic ---
    const modeUploadBtn = document.getElementById('mode-upload');
    const modeWebcamBtn = document.getElementById('mode-webcam');
    const uploadFormContainer = document.getElementById('upload-form');
    const webcamContainer = document.getElementById('webcam-container');
    
    const webcamVideo = document.getElementById('webcam-video');
    const webcamCanvas = document.getElementById('webcam-canvas');
    const startWebcamBtn = document.getElementById('start-webcam-btn');
    
    let webcamStream = null;
    let webcamInterval = null;
    let isWebcamDetecting = false;

    if (modeUploadBtn && modeWebcamBtn) {
        modeUploadBtn.addEventListener('click', () => {
            modeUploadBtn.classList.add('active');
            modeWebcamBtn.classList.remove('active');
            uploadFormContainer.style.display = 'block';
            webcamContainer.style.display = 'none';
            stopWebcam();
            resetResultUI();
        });

        modeWebcamBtn.addEventListener('click', () => {
            modeWebcamBtn.classList.add('active');
            modeUploadBtn.classList.remove('active');
            uploadFormContainer.style.display = 'none';
            webcamContainer.style.display = 'block';
            resetResultUI();
        });
    }

    if (startWebcamBtn) {
        startWebcamBtn.addEventListener('click', async () => {
            if (isWebcamDetecting) {
                stopWebcam();
                return;
            }

            try {
                webcamStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
                });
                webcamVideo.srcObject = webcamStream;
                
                webcamVideo.onloadedmetadata = () => {
                    webcamCanvas.width = webcamVideo.videoWidth;
                    webcamCanvas.height = webcamVideo.videoHeight;
                };

                startWebcamBtn.textContent = 'Stop Webcam';
                startWebcamBtn.style.background = 'var(--error-color)';
                isWebcamDetecting = true;
                
                startDetectionLoop();
            } catch (err) {
                console.error("Error accessing webcam:", err);
                alert("Could not access webcam. Please make sure you have granted camera permissions.");
            }
        });
    }

    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
        if (webcamInterval) {
            clearInterval(webcamInterval);
            webcamInterval = null;
        }
        if (webcamVideo) webcamVideo.srcObject = null;
        if (startWebcamBtn) {
            startWebcamBtn.textContent = 'Start Webcam';
            startWebcamBtn.style.background = '';
        }
        isWebcamDetecting = false;
        
        if (webcamCanvas) {
            const ctx = webcamCanvas.getContext('2d');
            ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);
        }
        resetResultUI();
    }

    function resetResultUI() {
        resultContainer.style.display = 'none';
        resultTitle.textContent = "Result";
        probPercentText.textContent = "0%";
        progressFill.style.width = "0%";
    }

    async function startDetectionLoop() {
        // Run detection every 500ms (2 FPS)
        webcamInterval = setInterval(async () => {
            if (!isWebcamDetecting || webcamVideo.readyState !== webcamVideo.HAVE_ENOUGH_DATA) return;

            const hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = webcamVideo.videoWidth;
            hiddenCanvas.height = webcamVideo.videoHeight;
            const ctx = hiddenCanvas.getContext('2d');
            
            // Mirror the drawing to match the CSS scaleX(-1) so coordinates align correctly
            ctx.translate(hiddenCanvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(webcamVideo, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
            
            hiddenCanvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('file', blob, 'webcam_frame.jpg');

                try {
                    const response = await fetch('/detect', { method: 'POST', body: formData });
                    if (response.ok) {
                        const data = await response.json();
                        drawBoundingBoxes(data.boxes, data.confidence_scores, data.cars_detected);
                    }
                } catch (e) {
                    console.error("Webcam detection error:", e);
                }
            }, 'image/jpeg', 0.8);
            
        }, 500); 
    }

    function drawBoundingBoxes(boxes, scores, count) {
        const ctx = webcamCanvas.getContext('2d');
        ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);
        
        if (count > 0) {
            resultContainer.style.display = 'block';
            resultContainer.className = 'result-container success';
            resultTitle.textContent = `${count} Car(s) Detected`;
            const maxConf = Math.max(...scores);
            const percent = (maxConf * 100).toFixed(1);
            probPercentText.textContent = `${percent}% (Max Conf)`;
            progressFill.style.width = `${percent}%`;

            boxes.forEach((box, i) => {
                const [x_min, y_min, x_max, y_max] = box;
                const width = x_max - x_min;
                const height = y_max - y_min;
                const conf = (scores[i] * 100).toFixed(0);

                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(x_min, y_min, width, height);

                ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                ctx.fillRect(x_min, y_min - 25, 80, 25);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 16px Arial';
                // Because canvas is mirrored in CSS, we draw text normally but it might appear flipped if we don't handle it.
                // Wait! Since canvas is CSS mirrored, drawing text normally will result in mirrored text!
                // To fix: save, translate to box center, scale(-1, 1), draw text, restore.
                ctx.save();
                ctx.translate(x_min + 5, y_min - 7);
                ctx.scale(-1, 1);
                // Adjust x to draw correctly since we scaled -1
                ctx.fillText(`Car ${conf}%`, -70, 0); 
                ctx.restore();
            });
        } else {
            resetResultUI();
        }
    }
});
