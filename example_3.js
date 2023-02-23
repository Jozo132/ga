// @ts-check
'use strict'

const GA = require('./vovk-ga')
const trainer = new GA()

console.log(`Example 3: Intermediate function optimization`)

const parameters = { variable: ['x', 'y'], type: 'number', range: { min: -2, max: 2 }, snap: 0.0001 }

const desiredOutput = 3

const test = (x, y) => {
    const a = 1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)
    const b = 30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x ** 2 + 48 * y - 36 * x * y + 27 * y ** 2)
    const output = a * b
    return output
}

const fitnessFunction = (sample) => {
    const { x, y } = sample
    const output = test(x, y)
    return output - desiredOutput
}

const conf = {
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
}

const logProgress = progress => {
    console.log(progress.message)
}

const logResult = result => { // Final results
    console.log(result.message)
    const { x, y } = result.parameters
    console.log(`Test ${test.toString()}    --->    ${test(x, y)}`)
}

const catchError = e => {
    if (e === 'timeout') console.log('Training timeout!')
    else throw e
}

console.log(`Starting training...`)
trainer.configure(conf).evolve(100, logProgress)
    .then(logResult)
    .catch(catchError)