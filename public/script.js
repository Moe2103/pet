
// console.log("ciao")


// SETTING ALL VARIABLES
let isMouseDown=false;

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

// GET MOUSE POSITION
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// ON MOUSE DOWN
function mousedown(canvas, evt) {
  const mousePos = getMousePos(canvas, evt);
  isMouseDown=true
  var currentPosition = getMousePos(canvas, evt);
  ctx.moveTo(currentPosition.x, currentPosition.y)
  ctx.beginPath();
  ctx.lineCap = "round";
}

// ON MOUSE MOVE
function mousemove(canvas, evt) {

  if(isMouseDown){
    const currentPosition = getMousePos(canvas, evt);
    ctx.lineTo(currentPosition.x, currentPosition.y)
    ctx.stroke();
  }
}

// ON MOUSE UP
function mouseup() {
  isMouseDown=false
}

exports.signat = function() {
  canvas.addEventListener('mousedown', () => {
    mousedown(canvas, evt);

  canvas.addEventListener('mousemove',() =>  {
    mousemove(canvas, evt);
  });
  canvas.addEventListener('mouseup',mouseup);
  // add event listener for mouseleave
  canvas.addEventListener('mouseleave', function(){
      return dataURL = canvas.toDataURL();
      console.log(dataURL)
      
  });
});
}

// let prevX = 0
// let prevY = 0
// let currY = 0
// let currX = 0

// function init() {
// canvas.addEventListener("mousemove", function (e) {
//     findxy('move', e)
// }, false);
// canvas.addEventListener("mousedown", function (e) {
//     findxy('down', e)
// }, false);
// canvas.addEventListener("mouseup", function (e) {
//     findxy('up', e)
// }, false);
// canvas.addEventListener("mouseout", function (e) {
//     findxy('out', e)
// }, false);

// ctx.beginPath();
//             ctx.moveTo(prevX, prevY);
//             ctx.lineTo(currX, currY);
//             ctx.stroke();
//             ctx.closePath();

            
