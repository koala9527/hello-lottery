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
        resultContent.innerHTML = ''; // Clear previous results

        if (data.code === 200 && typeof data.data === 'object') {
            const resultData = data.data;

            // Create Lottery Card
            const card = document.createElement('div');
            card.className = 'lottery-card';

            // Header
            const header = document.createElement('div');
            header.className = 'lottery-header';
            header.innerHTML = `
                <div class="lottery-title">
                    <span class="lottery-name">${resultData.name}</span>
                    <span class="lottery-issue">第 ${resultData.issue} 期</span>
                </div>
                <div class="game-type">${resultData.game_type}</div>
            `;
            card.appendChild(header);

            // Winning Numbers
            if (resultData.winning_numbers) {
                const winningSection = document.createElement('div');
                winningSection.className = 'winning-section';
                winningSection.innerHTML = '<div class="section-label">开奖号码</div>';

                const ballsContainer = document.createElement('div');
                ballsContainer.className = 'balls-container';

                resultData.winning_numbers.red.forEach(num => {
                    const ball = document.createElement('div');
                    ball.className = 'ball red';
                    ball.textContent = num;
                    ballsContainer.appendChild(ball);
                });

                resultData.winning_numbers.blue.forEach(num => {
                    const ball = document.createElement('div');
                    ball.className = 'ball blue';
                    ball.textContent = num;
                    ballsContainer.appendChild(ball);
                });

                winningSection.appendChild(ballsContainer);
                card.appendChild(winningSection);
            }

            // User Ticket Rows
            const ticketRows = document.createElement('div');
            ticketRows.className = 'ticket-rows';
            ticketRows.innerHTML = '<div class="section-label">识别结果</div>';

            resultData.rows.forEach((row, index) => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'ticket-row';

                // Index
                const indexDiv = document.createElement('div');
                indexDiv.className = 'row-index';
                indexDiv.textContent = index + 1;
                rowDiv.appendChild(indexDiv);

                // Numbers
                const numbersDiv = document.createElement('div');
                numbersDiv.className = 'row-numbers';

                row.red.forEach(item => {
                    const ball = document.createElement('div');
                    ball.className = `ball red ${item.isHit ? 'hit' : ''}`;
                    ball.textContent = item.value;
                    numbersDiv.appendChild(ball);
                });

                row.blue.forEach(item => {
                    const ball = document.createElement('div');
                    ball.className = `ball blue ${item.isHit ? 'hit' : ''}`;
                    ball.textContent = item.value;
                    numbersDiv.appendChild(ball);
                });

                rowDiv.appendChild(numbersDiv);

                // Prize Info
                const prizeDiv = document.createElement('div');
                prizeDiv.className = 'prize-info';
                const isWin = row.prize && row.prize !== '未中奖';
                prizeDiv.innerHTML = `<span class="prize-badge ${isWin ? 'win' : 'lose'}">${row.prize || '未中奖'}</span>`;
                rowDiv.appendChild(prizeDiv);

                ticketRows.appendChild(rowDiv);
            });

            card.appendChild(ticketRows);
            resultContent.appendChild(card);

        } else {
            // Error or fallback
            resultContent.innerHTML = `<div class="error-message">${data.msg || '识别失败'}</div>`;
            if (typeof data.data === 'string') {
                const pre = document.createElement('pre');
                pre.textContent = data.data;
                resultContent.appendChild(pre);
            }
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
        resultContent.innerHTML = '';
    }
});
