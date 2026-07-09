document.addEventListener('DOMContentLoaded', () => {
    const spatialRange = document.getElementById('spatialRange');
    const logicRange = document.getElementById('logicRange');
    const spatialValue = document.getElementById('spatialValue');
    const logicValue = document.getElementById('logicValue');
    const storyMode = document.getElementById('storyMode');
    const positionTitle = document.getElementById('positionTitle');
    const positionDesc = document.getElementById('positionDesc');
    const vizHint = document.getElementById('vizHint');
    const canvas = document.getElementById('blendCanvas');
    const ctx = canvas.getContext('2d');

    function updatePosition() {
        const s = parseInt(spatialRange.value);
        const l = parseInt(logicRange.value);
        const mode = storyMode.value;

        spatialValue.textContent = s;
        logicValue.textContent = l;
        vizHint.textContent = `Spatial weight ${s} / Logic weight ${l}`;

        let title = "Spatial Systems Architect";
        let desc = "설계 의도를 데이터/규칙으로 변환해 형태와 경험을 동시에 최적화합니다.";

        if (s > 80 && l < 50) {
            title = "Spatial Storyteller";
            desc = "공간의 시퀀스와 감각적인 내러티브에 집중하여 압도적인 공간 경험을 설계합니다.";
        } else if (l > 80 && s < 50) {
            title = "Computational Designer";
            desc = "복잡한 파라메트릭 규칙과 데이터 구조를 설계하여 최적화된 결과물을 도출합니다.";
        } else if (s > 70 && l > 70) {
            title = "Hybrid Spatial Engineer";
            desc = "건축적 감각과 공학적 로직을 결합하여 세상에 없던 공간 시스템을 구축합니다.";
        }

        positionTitle.textContent = title;
        positionDesc.textContent = desc;

        // Dynamic Proof Card Highlighting
        const cards = document.querySelectorAll('.proof-card');
        cards.forEach(card => card.classList.remove('large'));

        if (s > 70 && l > 70) {
            document.querySelector('.proof-card[data-kind="hybrid"]')?.classList.add('large');
        } else if (s > l && s > 60) {
            document.querySelector('.proof-card[data-kind="spatial"]')?.classList.add('large');
        } else if (l > s && l > 60) {
            document.querySelector('.proof-card[data-kind="logic"]')?.classList.add('large');
        } else {
            // Default or low values
            document.querySelector('.proof-card[data-kind="spatial"]')?.classList.add('large');
        }

        drawViz(s, l);
    }

    function drawViz(s, l) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw grid-like pattern based on weights
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        const gap = 30;
        for (let x = 0; x < canvas.width; x += gap) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gap) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Animated "Blob" or Geometry
        const time = Date.now() * 0.001;
        ctx.fillStyle = `rgba(0, 255, 157, ${0.1 + (l / 200)})`;
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const offset = Math.sin(time + i) * (l * 0.5);
            const r = (s * 1.5) + offset;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Data points
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(i * 678.90 + time) * 0.5 + 0.5) * canvas.height;
            const size = (l / 100) * 3;
            ctx.fillRect(x, y, size, size);
        }
    }

    spatialRange.addEventListener('input', updatePosition);
    logicRange.addEventListener('input', updatePosition);
    storyMode.addEventListener('change', updatePosition);

    function animate() {
        drawViz(parseInt(spatialRange.value), parseInt(logicRange.value));
        requestAnimationFrame(animate);
    }

    updatePosition();
    animate();
});
