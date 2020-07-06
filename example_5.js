// @ts-check
'use strict'

const GA = require('./vovk-ga')
const trainer = new GA()

const complexity = 20 // Change this number to test a different number of cities

console.log(`Example 5: Traveling Salesman Problem - ${complexity} cities`)

const cityList = new Array(complexity).fill(1).map((x, i) => i)

/** @param {any[]} A * @param {number} [i] */// @ts-ignore
const rotateArray = (A, i) => { const B = A.map(x => x); i = i || 0; for (let x = 1; x <= i; x++) B.shift(B.push(B[0])); return B }

class TSPCity {
    /** @param {number} [width] * @param {number} [height] */
    constructor(width, height) {
        this.width = width || 100
        this.height = height || 100
        this.x = 0
        this.y = 0
        this.randomizePosition()
    }
    /** @param {number} [width] * @param {number} [height] */
    randomizePosition(width, height) {
        this.width = width || this.width
        this.height = height || this.height
        const { width: w, height: h } = this
        this.x = Math.round(Math.random() * w)
        this.y = Math.round(Math.random() * h)
    }
}

class TravelingSalesman {
    /** @param {{ count: number; width?: number; height?: number; }} options */
    constructor(options) {
        const { count, width, height } = options
        this.count = count || 6
        this.combinations = []
        this.width = width || 100
        this.height = height || 100
        this.cities = []
        for (let i = 0; i < this.count; i++) {
            this.combinations.push(i)
            this.cities.push(new TSPCity(this.width, this.height))
        }
    }
    /** @param {number} indexA * @param {number} indexB */
    distanceBetweenPoints(indexA, indexB) {
        const x1 = this.cities[indexA].x
        const x2 = this.cities[indexB].x
        const y1 = this.cities[indexA].y
        const y2 = this.cities[indexB].y
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        return distance
    }
    combinationDistance(combination) {
        let distance = 0
        for (let i = 1; i < combination.length; i++) {
            const p1 = combination[i - 1]
            const p2 = combination[i]
            const d = this.distanceBetweenPoints(p1, p2)
            distance += d
        }
        const d = this.distanceBetweenPoints(combination[combination.length - 1], combination[0]) // Add distance back to beginning
        distance += d
        return distance
    }
}


const dataSet = new TravelingSalesman({ count: complexity /* 8 */ })
console.log(`Creating cities ...`)
dataSet.cities.forEach((city, i) => {
    console.log(`\t${i}: { x: ${city.x} y: ${city.y} }`)
})

/** @param {any[]} A */
const shuffleArray = A => { const B = A.map(x => x); for (let i = B.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * i); const temp = B[i]; B[i] = B[j]; B[j] = temp; } return B }


const parameters = { variable: 'path', type: 'combination', options: cityList /* [0, 1, 2, 3, 4, 5, 6, 7] */, start: 0, /* repeat: true */ }


const fitnessFunction = (sample, /* callback */) => {   // optional async callback
    const { path } = sample
    let distance = dataSet.combinationDistance(path)
    //callback(distance) 
    return distance
}

const conf = {
    //debug: true,
    maxPopulation: 10000,
    survivorsPERCENT: 0.10,
    crossoverChance: 0.05,
    mutationChance: 0.05,
    mutationPower: 1,
    bestSurvive: true,
    parameters: parameters,
    initialValues: { path: cityList }, // Start out with a default path of [ 0, 1, 2, 3 ... n-1 ]
    fitnessFunction: fitnessFunction,
    fitnessTargetValue: 0,
    fitnessTimeout: 10000,
    //fitnessTargetTolerance: 1e-15,
}

const logProgress = progress => {
    console.log(progress.message)
}

const logResult = result => {
    console.log(result.message)
    console.log(`Example 5: Traveling Salesman Problem - ${complexity} cities - Finished!`)
    console.log(`\tRandom combinations:`)
    for (let i = 0; i < 8; i++) {
        let randomCombination = shuffleArray(dataSet.combinations)
        if (parameters.start !== undefined && randomCombination.includes(parameters.start))
            randomCombination = rotateArray(randomCombination, randomCombination.indexOf(parameters.start))
        const distance = dataSet.combinationDistance(randomCombination)
        console.log(`\t\tDistance for [${randomCombination}] = ${distance}`)
    }
    console.log(`\tTrained result:`)
    const trainedCombination = result.parameters.path
    const distance = dataSet.combinationDistance(trainedCombination)
    console.log(`\t\tDistance for [${trainedCombination}] = ${distance}`)
}

const catchError = e => {
    if (e === 'timeout') console.log('Training timeout!')
    else throw e
}

setTimeout(() => {
    console.log(`Starting training...`)
    trainer.configure(conf).evolve(100, logProgress)
        .then(logResult)
        .catch(catchError)
}, 1000)