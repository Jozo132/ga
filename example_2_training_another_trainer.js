// @ts-check
'use strict'


const GA = require('./ga')

const getVector = (...a) => Math.sqrt((Array.isArray(a[0]) ? a[0] : a).reduce((sum, val) => sum += val ** 2, 0))

const initialValues_INLINE = { x: 1, y: 1, z: 1 }
const parameters_INLINE = { variable: ['x', 'y', 'z'], type: 'number', range: { min: -20, max: 20 } }

const myFitnessFunction_INLINE = (sample, callback) => {
    let { x, y, z } = sample

    let desired_output = 10 // Desired function output
    let actual_output = getVector(x, y, z) // Function to optimize parameters on

    let error = desired_output - actual_output
    callback(error)
}

const trainTrainer = (config, callback) => {
    const puppet = new GA()
    puppet.configure({
        debug: false,
        maxPopulation: config.population,
        survivorsPERCENT: config.survivor_pct,
        crossoverChance: config.crossoverChance,
        mutationChance: config.mutationChance,
        mutationPower: config.mutationPower,
        parameters: parameters_INLINE,
        initialValues: initialValues_INLINE,
        fitnessTargetValue: 0,
        bestSurvive: true,
        fitnessFunction: myFitnessFunction_INLINE,
        fitnessTimeout: 10000,
        fitnessTimeoutFunction: () => { throw 'Training timeout!' }
    })
    puppet.evolve(config.generations,
        results => { },
        finalResults => {
            setTimeout(() => callback(finalResults.fitness), 100)    // Return reference value
        }
    )
}




// Primary training

//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.1162, "crossoverChance": 0.0074, "mutationChance": 0.2643, "mutationPower": 0.00039 } // Fitness:  0.000000003812
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.0852, "crossoverChance": 0.1669, "mutationChance": 0.35094, "mutationPower": 0.00561 } // Fitness:  0.000000000646
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.101, "crossoverChance": 0.0717, "mutationChance": 0.2181, "mutationPower": 0.00204 } // Fitness: -0.000000000448
//const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.134, "crossoverChance": 0.1, "mutationChance": 0.332, "mutationPower": 0.0015 } // Fitness:  0.000000000073
//const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.211, "crossoverChance": 0.1192, "mutationChance": 0.1003, "mutationPower": 0.00051 } // Fitness: -0.000000000061
//const trained_GA_config = { "generations": 10, "population": 95, "survivor_pct": 0.083, "crossoverChance": 0.1, "mutationChance": 0.3128, "mutationPower": 0.06389 }
const trained_GA_config = { "generations": 10, "population": 150, "survivor_pct": 0.05, "crossoverChance": 0.1106, "mutationChance": 0.5, "mutationPower": 0.17434000000000002 }

const parameters = [
    { variable: 'generations', type: 'integer', range: { min: 10, max: 10 } },
    { variable: 'population', type: 'integer', range: { min: 150, max: 500 } },
    { variable: 'survivor_pct', type: 'number', range: { min: 0.05, max: 0.5 }, snap: 0.001 },
    { variable: 'crossoverChance', type: 'number', range: { min: 0.0, max: 0.3 }, snap: 0.0001 },
    { variable: 'mutationChance', type: 'number', range: { min: 0.0, max: 0.5 }, snap: 0.0001 },
    { variable: 'mutationPower', type: 'number', range: { min: 0.0, max: 0.5 }, snap: 0.00001 }
]


const master = new GA()

master.configure({
    debug: false,
    maxPopulation: 500,
    survivorsPERCENT: trained_GA_config.survivor_pct,
    crossoverChance: trained_GA_config.crossoverChance,
    mutationChance: trained_GA_config.mutationChance,
    mutationPower: trained_GA_config.mutationPower,
    parameters: parameters,
    initialValues: trained_GA_config,
    fitnessTargetValue: 0,
    bestSurvive: true,
    fitnessFunction: trainTrainer,
    fitnessTimeout: 60000,
    fitnessTimeoutFunction: () => { throw 'Training timeout!' }
})

console.log(`Training the trainer now!`)

master.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
    }
)