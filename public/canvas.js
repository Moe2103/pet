let isDrawing = false;
let x = 0;
let y = 0;

const canvas = $("#canvas");
const ctx = $("#canvas")[0].getContext("2d");
const signature = $("#signature");

canvas.on("mousedown", (event) => {
    x = event.offsetX;
    y = event.offsetY;
    isDrawing = true;
});

canvas.on("mousemove", (event) => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, event.offsetX, event.offsetY);
        x = event.offsetX;
        y = event.offsetY;
    }
});

canvas.on("mouseup", (event) => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, event.offsetX, event.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;

        const dataURL = canvas[0].toDataURL();
        signature.val(dataURL);
    }
});

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}
