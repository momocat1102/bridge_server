class Timer {
    constructor(minutes, callback) {
        this.times = minutes * 60 * 1000;
        this.callback = callback
        this.is_hold = false;
    }

    getMinute = () => {
        return Math.ceil(this.times / (60 * 1000));
    }

    hold = (reject) => {
        if (this.is_hold) {
            return
        }
        this.is_hold = true;
        this.reject = reject;
        this.date = new Date();
        this.ticks = 0;
        this.clock = setInterval(() => {
            this.ticks += 1;
            let minute = Math.ceil(this.times / (60 * 1000));
            this.times -= 1000;
            if (this.times <= 0) {
                this.release();
                return
            } else if (Math.ceil(this.times / (60 * 1000)) !== minute) {
                this.callback(this.times);
            }
        }, 1000);
    }

    release = () => { // 計算尾數
        if (!this.is_hold) {
            return
        }
        this.is_hold = false;
        clearInterval(this.clock);
        this.times -= new Date() - this.date - this.ticks * 1000;
        if (this.times <= 0) {
            this.reject("time out");
            this.callback(0);
        }
    };

}
//asdfghjk
module.exports = { Timer: Timer };