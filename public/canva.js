console.log("Hi");

// // Setting ALL variables
let isMouseDown = false;
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
// const submit = document.querySelector("signs");
const hiddenInput = document.querySelector(".signs");

canvas.addEventListener("mousedown", () => {
    console.log("Mouse Down");
    mousedown(canvas, event);
});

canvas.addEventListener("mousemove", () => {
    mousemove(canvas, event);
});

canvas.addEventListener("mouseup", mouseup);

// canvas.addEventListener("submitButton", () => {
//     console.log("Submit");
// });

// // Need to add event listner for mouseleave
// canvas.addEventListener("mouseleave", mouseleave);

// // Getting Mouse Position
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
}

// // Mouse Down
function mousedown(canvas, evt) {
    const mousePos = getMousePos(canvas, evt);
    isMouseDown = true;
    var currentPosition = getMousePos(canvas, evt);
    ctx.moveTo(currentPosition.x, currentPosition.y);
    ctx.beginPath();
    ctx.lineCap = "round";
}

// // Mouse Move
function mousemove(canvas, evt) {
    if (isMouseDown) {
        const currentPosition = getMousePos(canvas, evt);
        ctx.lineTo(currentPosition.x, currentPosition.y);
        ctx.stroke();
    }
}

// // Mouse Up
function mouseup() {
    isMouseDown = false;
    // console.log("Hi");
    // console.log(canvas.toDataURL());
    hiddenInput.value = canvas.toDataURL();
    console.log(hiddenInput.value);
}

// Then part 5
//// --- Edit Profiles
/// Middleware for checking cooking and logging conditions
