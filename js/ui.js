class UIController {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.dropZone = document.getElementById('dropZone');
        this.formatSelect = document.getElementById('formatSelect');
        this.qualityInput = document.getElementById('qualityInput');
        this.qualityValue = document.getElementById('qualityValue');
        this.resizeToggle = document.getElementById('resizeToggle');
        this.maxWidthInput = document.getElementById('maxWidth');
        this.processBtn = document.getElementById('processBtn');
        this.resultsContainer = document.getElementById('results');
        
        this.selectedFiles = [];
        this.init();
    }

    init() {
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.processBtn.addEventListener('click', () => this.triggerProcessing());
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => this.dropZone.addEventListener(evt, e => e.preventDefault(), false));
        this.dropZone.addEventListener('drop', (e) => {
            this.dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        this.qualityInput.addEventListener('input', () => this.qualityValue.textContent = this.qualityInput.value);
        this.resizeToggle.addEventListener('change', (e) => this.maxWidthInput.disabled = !e.target.checked);
    }

    handleFiles(fileList) {
        this.selectedFiles = Array.from(fileList);
        this.processBtn.disabled = this.selectedFiles.length === 0;
    }

    triggerProcessing() {
        const options = {
            format: this.formatSelect.value,
            quality: parseInt(this.qualityInput.value) / 100,
            resize: this.resizeToggle.checked,
            maxWidth: parseInt(this.maxWidthInput.value) || 1920
        };
        document.dispatchEvent(new CustomEvent('processImages', { detail: { files: this.selectedFiles, options } }));
    }

    displayResult(originalFile, processedBlob) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${URL.createObjectURL(processedBlob)}" alt="Result">
            <div class="result-info">
                <h4>${processedBlob.name}</h4>
                <p>${this.formatBytes(originalFile.size)} → ${this.formatBytes(processedBlob.size)}</p>
            </div>
            <a href="${URL.createObjectURL(processedBlob)}" download="${processedBlob.name}" class="download-btn">Download</a>
        `;
        this.resultsContainer.prepend(card);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
