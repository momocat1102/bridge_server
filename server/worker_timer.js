const { parentPort } = require('worker_threads');

let date = new Date();
console.log("initial date", date);
let seconds = 0;
let t = setInterval(() => {
    parentPort.postMessage("");
    seconds += 1
}, 1000)

parentPort.on('message', (message) => {
    if (message !== "") {
        console.log('mes&date', message, date);
        parentPort.postMessage((message - date) - (seconds * 1000))
    }
    clearInterval(t);
    process.exit(0);
})