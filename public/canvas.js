function canvasDraw() {
    return new Promise((resolve, reject) => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        canvas.addEventListener("mousedown", (event) => {
            isDrawing = true;
            lastX = event.offsetX;
            lastY = event.offsetY;
        });

        canvas.addEventListener("mousemove", (event) => {
            if (!isDrawing) return;
            const currentX = event.offsetX;
            const currentY = event.offsetY;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = "black";
            ctx.stroke();
            lastX = currentX;
            lastY = currentY;
        });

        canvas.addEventListener("mouseup", (event) => {
            isDrawing = false;
            const signature = canvas.toDataURL();
            document.querySelector('input[name="signature"]').value = signature;
            resolve(signature);
        });
    });
}
canvasDraw();
