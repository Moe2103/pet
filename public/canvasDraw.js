const canvas = document.getElementById("signature-canvas");
const ctx = canvas.getContext("2d");
const sigSelector = document.getElementById("input-sig");

// $(".delete-data").on("click", function (e) {
//     e.preventDefault();
//     $.ajax({
//         type: "POST",
//         url: "/thanks",
//         success: function (response) {
//             console.log(response);
//         },
//     });
// });

function canvasDraw() {
    return new Promise((resolve, reject) => {
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
            sigSelector.value = signature;
            resolve(signature);
        });
    });
}
canvasDraw();
