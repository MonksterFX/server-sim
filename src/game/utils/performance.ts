export class PerformanceMonitor {
    private _last: number = 0;
    private _lastDuration: number = 0;

    private _durations: number[] = [];

    get startedAt(){
        return this._last;
    }

    get last(){
        return this._lastDuration;
    }

    get avg(){
        if(this._durations.length === 0) return 0;
        const sum = this._durations.reduce((a,b) => a + b, 0);
        return Math.floor(sum / this._durations.length);
    }

    get max(){
        if(this._durations.length === 0) return 0;
        return Math.max(...this._durations);
    }

    get min(){
        if(this._durations.length === 0) return 0;
        return Math.min(...this._durations);
    }

    get spread(){
        return this.max - this.min;
    }

    startTask() {
        this._last =  performance.now()
    }   

    endTask() {
        this._lastDuration = performance.now() - this._last;
        this._durations.push(this._lastDuration);
        if(this._durations.length > 100){
            this._durations.shift();
        }
        return this._lastDuration;
    }
}