document.addEventListener('DOMContentLoaded', () => {
    const uploadSection = document.getElementById('upload-section');
    const previewSection = document.getElementById('preview-section');
    const resultSection = document.getElementById('result-section');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewImage = document.getElementById('preview-image');
    const reuploadBtn = document.getElementById('reupload-btn');
    const predictBtn = document.getElementById('predict-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultContent = document.getElementById('result-content');

    let currentFile = null;

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    reuploadBtn.addEventListener('click', () => {
        resetUI();
    });

    predictBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        showLoading(true);
        resultSection.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            displayResult(data);
        } catch (error) {
            console.error('Error:', error);
            displayResult({ code: 500, msg: '请求失败', data: error.message });
        } finally {
            showLoading(false);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingOverlay.classList.remove('hidden');
            predictBtn.disabled = true;
            reuploadBtn.disabled = true;
        } else {
            loadingOverlay.classList.add('hidden');
            predictBtn.disabled = false;
            reuploadBtn.disabled = false;
        }
    }

    function displayResult(data) {
        resultSection.classList.remove('hidden');
        // Format the output nicely
        if (data.code === 200) {
            try {
                // Try to parse the inner data string if it looks like a stringified representation
                // The backend returns 'data' as a string representation of the Result object or tuple
                // We'll just display it as text for now, but could be improved if backend returned structured JSON
                resultContent.textContent = data.data;
            } catch (e) {
                resultContent.textContent = JSON.stringify(data, null, 2);
            }
        } else {
            resultContent.textContent = `Error: ${data.msg}`;
        }
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function resetUI() {
        currentFile = null;
        fileInput.value = '';
        uploadSection.classList.remove('hidden');
        previewSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        resultContent.textContent = '';
    }
});
