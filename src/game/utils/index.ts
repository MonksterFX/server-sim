export function  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomSelect<T>(values: T[]): T {
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
}

export function randomSelectWeighted<T>(values: T[], weights: number[]): T {
    const cumulativeWeights: number[] = [];
    weights.reduce((acc, weight, index) => {
        cumulativeWeights[index] = acc + weight;
        return cumulativeWeights[index];
    }, 0);

    const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) {
            return values[i];
        }
    }

    return values[values.length - 1];
}