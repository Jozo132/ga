// @ts-check
'use strict'

const GA = require('./vovk-ga')
const trainer = new GA()

console.log(`Example 1: Simple function optimization`)

const MY_FUNCTION = (x, y, z) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))

// (1) Direct return fitness function
// const myFitnessFunction = (sample) => {
//     const { x, y, z } = sample
//     let desired_output = Math.PI               // Desired function output
//     let actual_output = MY_FUNCTION(x, y, z)   // My function
//     let loss = Math.abs(desired_output - actual_output)
//     return loss
// }

// (2) Callback return fitness function
// const myFitnessFunction = (sample, callback) => {
//     const { x, y, z } = sample
//     let desired_output = Math.PI               // Desired function output
//     let actual_output = MY_FUNCTION(x, y, z)   // My function
//     let loss = Math.abs(desired_output - actual_output)
//     callback(loss)
// }

// (3) Promise return fitness function
const myFitnessFunction = (sample) => new Promise((resolve, reject) => {
    try {
        const { x, y, z } = sample
        let desired_output = Math.PI               // Desired function output
        let actual_output = MY_FUNCTION(x, y, z)   // My function
        let loss = Math.abs(desired_output - actual_output)
        resolve(loss)
    } catch (e) { reject(e) }
})

const parameters = [
    { variable: 'x', type: 'number', range: { min: -20, max: 20 } },
    { variable: 'y', type: 'number', range: { min: -20, max: 20 }, snap: 1 },
    { variable: 'z', type: 'number', range: { min: -20, max: 20 }, snap: 0.1 },
    // { variable: 'p', type: 'option', options: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0] }
]




const logProgress = progress => {
    console.log(progress.message)
}

const logResult = result => {
    console.log(result.message)
    const { x, y, z } = result.parameters
    console.log(`Test ${MY_FUNCTION.toString()}    --->     ${MY_FUNCTION(x, y, z)}`)
}

const catchError = e => {
    if (e === 'timeout') console.log('Training timeout!')
    else throw e
}

const config = {
    debug: false,
    maxPopulation: 1000,
    //survivors: 10,
    survivorsPERCENT: 0.05,
    crossoverChance: 0.25,
    mutationChance: 0.50,
    mutationPower: 0.25,
    parameters: parameters,
    initialValues: { x: 1, y: 1, z: 1 },
    fitnessTargetValue: 0,
    //fitnessTargetTolerance: 1e-15,
    bestSurvive: true,
    fitnessFunction: myFitnessFunction,
    fitnessTimeout: 10000
}

trainer.configure(config).evolve(100, logProgress)
    .then(logResult)
    .catch(catchError)