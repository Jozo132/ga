// @ts-check
'use strict'

const GA = require('./vovk-ga')
const trainer = new GA()

console.log(`Example 1: Simple function optimization`)

const MY_FUNCTION = (x, y, z) => Math.sqrt(x ** 2 + y ** 2 + z ** 2)
const desired_output = Math.PI               // Desired function output

// (1) Direct return fitness function
// const myFitnessFunction = (sample) => {
//     const { x, y, z } = sample
//     const desired_output = Math.PI               // Desired function output
//     const actual_output = MY_FUNCTION(x, y, z)   // My function
//     const loss = Math.abs(desired_output - actual_output)
//     return loss
// }

// (2) Promise return fitness function
// const myFitnessFunction = (sample) => new Promise((resolve, reject) => {
//     try {
//         const { x, y, z } = sample
//         const actual_output = MY_FUNCTION(x, y, z)   // My function
//         const loss = Math.abs(desired_output - actual_output)
//         resolve(loss)
//     } catch (e) { reject(e) }
// })

// (3) Promise return fitness function with async/await
const myFitnessFunction = async (sample) => {
    const { x, y, z } = sample
    const actual_output = MY_FUNCTION(x, y, z)   // My function
    const loss = Math.abs(desired_output - actual_output)
    return loss
}

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

const main = async () => {
    trainer.configure(config)
    const result = await trainer.evolve(100, logProgress)
    logResult(result)
}


main().catch(console.error)