console.log("js is connected");

let canvas = document.getElementById("drawing");
let context = canvas.getContext("2d");
context.strokeStyle = "#0000FF";
context.lineWidth = 5;
context.lineJoin = "round";
context.lineCap = "round";
let isDrawing = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener("mousedown", function (e) {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener("mousemove", function (e) {
    if (!isDrawing) return;
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
});
canvas.addEventListener("mouseup", function () {
    isDrawing = false;
    let dataURL = canvas.toDataURL();
    const hiddenValue = (document.getElementById("hidden").value = dataURL);
    console.log(hiddenValue);
    // });
});
canvas.addEventListener("mouseleave", function () {
    isDrawing = false;
});

//my setup for encoding

// const btn = document.querySelector('button');
// btn.addEventListener("click", function () {
//     let dataURL = canvas.toDataURL();
//     const hiddenValue = document.getElementById("hidden").value = dataURL;
//     console.log(hiddenValue);
// });

// Set up touch events for mobile, etc
var drawing = false;
var mousePos = { x: 0, y: 0 };
var lastPos = mousePos;
canvas.addEventListener(
    "touchstart",
    function (e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);
canvas.addEventListener(
    "touchend",
    function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    },
    false
);
canvas.addEventListener(
    "touchmove",
    function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top,
    };
}

// Prevent scrolling when touching the canvas
document.body.addEventListener(
    "touchstart",
    function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);
document.body.addEventListener(
    "touchend",
    function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);
document.body.addEventListener(
    "touchmove",
    function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);


