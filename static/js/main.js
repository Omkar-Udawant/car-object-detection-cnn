document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadForm = document.getElementById('upload-form');
    const uploadCard = document.getElementById('upload-card');
    const resultSection = document.getElementById('result-section');
    const loadingText = document.getElementById('loading-text');
    const optimizerSection = document.getElementById('optimizer-section');
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    
    // Result elements
    const resultImage = document.getElementById('result-image');
    const predText = document.getElementById('pred-text');
    const predBadge = document.getElementById('pred-badge');
    const confVal = document.getElementById('conf-val');
    const confBadge = document.getElementById('conf-badge');
    const confBar = document.getElementById('conf-bar');
    const inferVal = document.getElementById('infer-val');
    
    const probBarCar = document.getElementById('prob-bar-car');
    const probValCar = document.getElementById('prob-val-car');
    const probBarNotCar = document.getElementById('prob-bar-not-car');
    const probValNotCar = document.getElementById('prob-val-not-car');

    let currentFile = null;

    // Click to upload
    dropArea.addEventListener('click', (e) => {
        if(e.target !== fileInput && !currentFile) {
            fileInput.click();
        }
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
                processImage(currentFile);
            } else {
                alert("Please upload a valid image file.");
            }
        }
    }

    uploadAnotherBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        resultSection.style.display = 'none';
        uploadCard.style.display = 'block';
        if(optimizerSection) optimizerSection.style.display = 'block';
    });

    async function processImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        // UI Updates for Loading State
        uploadCard.style.display = 'none';
        if(optimizerSection) optimizerSection.style.display = 'none';
        loadingText.style.display = 'block';
        resultSection.style.display = 'none';

        try {
            const response = await fetch('/detect', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show result section
                loadingText.style.display = 'none';
                resultSection.style.display = 'block';
                
                // Set Image
                resultImage.src = `data:image/jpeg;base64,${data.annotated_image_base64}`;
                
                // Inference time
                inferVal.textContent = data.inference_time_ms || 0;
                
                const detailsCard = document.getElementById('details-card');
                const detailsTableBody = document.getElementById('details-table-body');
                const suggestionsCard = document.getElementById('suggestions-card');
                const suggestionsContainer = document.getElementById('suggestions-container');
                
                // Populate Suggestions
                if (suggestionsCard && suggestionsContainer && data.suggestions && data.suggestions.length > 0) {
                    suggestionsCard.style.display = 'block';
                    suggestionsContainer.innerHTML = '';
                    data.suggestions.forEach(sugg => {
                        const alertDiv = document.createElement('div');
                        alertDiv.className = `suggestion-alert ${sugg.type}`;
                        
                        let iconHtml = '';
                        if (sugg.type === 'critical') {
                            iconHtml = '<svg class="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
                        } else if (sugg.type === 'warning') {
                            iconHtml = '<svg class="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                        } else {
                            iconHtml = '<svg class="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                        }
                        
                        alertDiv.innerHTML = `${iconHtml}<div class="suggestion-content">${sugg.text}</div>`;
                        suggestionsContainer.appendChild(alertDiv);
                    });
                } else if (suggestionsCard) {
                    suggestionsCard.style.display = 'none';
                }
                
                if (data.cars_detected > 0) {
                    predText.textContent = data.congestion_level || "UNKNOWN";
                    predText.style.fontSize = '4.5rem';
                    
                    let statusColor = 'var(--accent-green)';
                    let badgeBg = 'rgba(34, 197, 94, 0.1)';
                    if (data.congestion_level === 'HIGH') {
                        statusColor = '#ef4444';
                        badgeBg = 'rgba(239, 68, 68, 0.1)';
                    } else if (data.congestion_level === 'MODERATE') {
                        statusColor = 'var(--accent-yellow)';
                        badgeBg = 'rgba(234, 179, 8, 0.1)';
                    }
                    
                    predText.style.color = statusColor;
                    predBadge.style.color = statusColor;
                    predBadge.style.background = badgeBg;
                    predBadge.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Traffic Status`;
                    
                    const maxConf = Math.max(...data.confidence_scores);
                    const percent = (maxConf * 100).toFixed(1);
                    
                    confVal.textContent = `${percent}%`;
                    setTimeout(() => { confBar.style.width = `${percent}%`; }, 100);
                    
                    if (maxConf > 0.8) {
                        confBadge.textContent = 'HIGH';
                        confBadge.style.color = 'var(--accent-green)';
                        confBadge.style.background = 'rgba(34, 197, 94, 0.15)';
                        confBar.style.background = 'var(--accent-green)';
                    } else {
                        confBadge.textContent = 'MEDIUM';
                        confBadge.style.color = 'var(--accent-yellow)';
                        confBadge.style.background = 'rgba(234, 179, 8, 0.15)';
                        confBar.style.background = 'var(--accent-yellow)';
                    }
                    
                    // Class Probs
                    probValCar.textContent = `${percent}%`;
                    probValNotCar.textContent = `${(100 - percent).toFixed(1)}%`;
                    
                    setTimeout(() => { 
                        probBarCar.style.width = `${percent}%`; 
                        probBarNotCar.style.width = `${(100 - percent).toFixed(1)}%`; 
                    }, 100);
                    
                    // Populate Details Table
                    detailsTableBody.innerHTML = '';
                    if (data.detected_objects && data.detected_objects.length > 0) {
                        if(detailsCard) detailsCard.style.display = 'block';
                        data.detected_objects.forEach(obj => {
                            const tr = document.createElement('tr');
                            
                            const tdId = document.createElement('td');
                            tdId.textContent = `Vehicle ${obj.id}`;
                            tr.appendChild(tdId);
                            
                            const tdType = document.createElement('td');
                            const badge = document.createElement('span');
                            badge.className = `type-badge ${obj.class.toLowerCase()}`;
                            badge.textContent = obj.class;
                            tdType.appendChild(badge);
                            tr.appendChild(tdType);
                            
                            const tdConf = document.createElement('td');
                            tdConf.textContent = `${(obj.confidence * 100).toFixed(1)}%`;
                            tr.appendChild(tdConf);
                            
                            detailsTableBody.appendChild(tr);
                        });
                    } else {
                        if(detailsCard) detailsCard.style.display = 'none';
                    }
                    
                } else {
                    predText.textContent = 'CLEAR';
                    predText.style.fontSize = '4.5rem';
                    predText.style.color = 'var(--accent-green)';
                    predBadge.style.color = 'var(--accent-green)';
                    predBadge.style.background = 'rgba(34, 197, 94, 0.1)';
                    predBadge.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Traffic Status';
                    
                    confVal.textContent = `0.0%`;
                    confBadge.textContent = 'LOW';
                    confBadge.style.color = '#ef4444';
                    confBadge.style.background = 'rgba(239, 68, 68, 0.15)';
                    setTimeout(() => { confBar.style.width = `0%`; }, 100);
                    
                    probValCar.textContent = `0.0%`;
                    probValNotCar.textContent = `100.0%`;
                    setTimeout(() => { 
                        probBarCar.style.width = `0%`; 
                        probBarNotCar.style.width = `100%`; 
                    }, 100);
                    
                    if(detailsCard) detailsCard.style.display = 'none';
                }
            } else {
                showError(data.error || "An unknown error occurred.");
            }
        } catch (error) {
            showError("Failed to connect to the server.");
        }
    }

    function showError(msg) {
        loadingText.style.display = 'none';
        uploadCard.style.display = 'block';
        alert(msg);
    }
});
