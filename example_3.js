// @ts-check
'use strict'

const GA = require('./ga')
const trainer = new GA()

const parameters = { variable: ['x', 'y'], type: 'number', range: { min: -2, max: 2 }, snap: 0.01 }

const desiredOutput = 3

const test = (x, y) => {
    const a = 1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)
    const b = 30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x ** 2 + 48 * y - 36 * x * y + 27 * y ** 2)
    const output = a * b
    return output
}

const fitnessFunction = (sample, /* callback */) => {   // optional async callback
    const { x, y } = sample
    const output = test(x, y)
    //callback(output) 
    return output - desiredOutput
}

trainer.configure({
    //debug: false,
    maxPopulation: 1000,
    survivorsPERCENT: 0.05,
    crossoverChance: 0.05,
    mutationChance: 0.45,
    mutationPower: 0.1,
    bestSurvive: true,
    parameters: parameters,
    //initialValues: { x: 0, y: 0 },
    fitnessFunction: fitnessFunction,
    fitnessTargetValue: 0,
    fitnessTimeout: 10000,
    fitnessTimeoutFunction: () => { throw 'Training timeout!' }
})

trainer.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
        const { x, y } = finalStatus.parameters
        console.log(`Test ${test.toString()}    --->    ${test(x, y)}`)
    }
)