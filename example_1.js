// @ts-check
'use strict'

const GA = require('./ga')


const MY_FUNCTION = (x, y, z) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))

const myFitnessFunction = (sample, returnFitness) => {
    const { x, y, z } = sample

    let desired_output = Math.PI               // Desired function output
    let actual_output = MY_FUNCTION(x, y, z)   // My function

    let error = Math.abs(desired_output - actual_output)
    returnFitness(error)
}

const parameters = [
    { variable: 'x', type: 'number', range: { min: -20, max: 20 } },
    { variable: 'y', type: 'number', range: { min: -20, max: 20 } },
    { variable: 'z', type: 'number', range: { min: -20, max: 20 }, snap: 0.0001 },
    // { variable: 'p', type: 'option', options: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0] }
]

//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.134, "crossoverChance": 0.1, "mutationChance": 0.332, "mutationPower": 0.0015 } // Fitness:  0.000000000073
const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.05, "crossoverChance": 0.2487, "mutationChance": 0.4853, "mutationPower": 0.24856000000000003 }


const trainer = new GA()

trainer.configure({
    debug: false,
    maxPopulation: trained_GA_config.population,
    //survivors: 10,
    survivorsPERCENT: trained_GA_config.survivor_pct,
    crossoverChance: trained_GA_config.crossoverChance,
    mutationChance: trained_GA_config.mutationChance,
    mutationPower: trained_GA_config.mutationPower,
    parameters: parameters,
    initialValues: { x: 1, y: 1, z: 1 },
    fitnessTargetValue: 0,
    bestSurvive: true,
    fitnessFunction: myFitnessFunction,
    fitnessTimeout: 10000,
    fitnessTimeoutFunction: () => console.log('Training timeout!')
})



trainer.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
        const { x, y, z } = finalStatus.parameters
        console.log(`Test ${MY_FUNCTION.toString()}    --->     ${MY_FUNCTION(x, y, z)}`)
    }
)