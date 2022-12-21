const arrow1 = document.getElementById('1');
function timeout() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        arrow1.style.color = randomColor;
        
        timeout();
    }, 100);
}
timeout();
const arrow2 = document.getElementById('2');
function timeout2() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        arrow2.style.color = randomColor;
        
        timeout2();
    }, 100);
}
timeout2();
const arrow3 = document.getElementById('3');
function timeout3() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        arrow3.style.color = randomColor;
        
        timeout3();
    }, 100);
}
timeout3();
// const text = arrows.textContent;
// const array = text.split("");
// console.log('array: ', array);
// const array = [1, 2, 3];
// //random index
// let actualRandomIndex;
// function timeoutForArray() {
//     setTimeout(function () {
//         function generateRandomIndex() {
//             let randomIndex = Math.floor(Math.random() * array.length);
//             actualRandomIndex = array[randomIndex];
//             // console.log('actualRandomIndex: ', actualRandomIndex);
//             // console.log('randomIndex: ', randomIndex);
//             return  actualRandomIndex;
//         }
//         generateRandomIndex();
       
//         // random color
//         function timeout() {
//             setTimeout(function () {
//                 function generateRandomVal() {
//                     return Math.floor(Math.random() * 256);
//                 }
//                 let r = generateRandomVal();
//                 let g = generateRandomVal();
//                 let b = generateRandomVal();
                
//                 let randomColor = "rgb(" + r + "," + g + "," + b + ")";
//                 let arrowCreatedHtml = document.createElement('i');
//                 console.log('arrowCreatedHtml', arrowCreatedHtml);
//                 arrowCreatedHtml.innerHTML = actualRandomIndex;
//                 console.log('actualRandomIndex', actualRandomIndex);
//                 arrowCreatedHtml.style.color = randomColor;
                
//                 timeout();
//             }, 2000);
//         }
//         timeout();
//         //end of random color function
//         timeoutForArray();
//     }, 2000);
// }
// timeoutForArray();