// @ts-check
'use strict'


const GA = require('./vovk-ga')

console.log(`Example 2: Optimizing optimizer parameters`)

const getVector = (...a) => Math.sqrt((Array.isArray(a[0]) ? a[0] : a).reduce((sum, val) => sum += val ** 2, 0))

const sq = x => x ** 2
const { cos, PI: pi } = Math

const mvfBohachevsky2 = {
    info:
        `\tMultivariate test: Bohachevsky (2) function\n\n` +
        `\t2-dimensional input with domain: |xi| ≤ 50\n` +
        `\tThe global minimum is 0 at the zeroth vector: ( 0, 0 )\n\n` +
        `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfBohachevsky2`,
    params: { variable: ['x0', 'x1'], type: 'number', range: { min: -50, max: 50 } },
    default: {},
    targetFitness: 0,
    fn: (sample, callback) => {
        callback = callback || (() => { })
        const { x0, x1 } = sample
        const output = sq(x0) + 2 * sq(x1) - 0.3 * cos(3 * pi * x0) * cos(4 * pi * x1) + 0.3
        callback(output)
        return output
    }
}


const initialValues_INLINE = { x: 1, y: 1, z: 1 }
const parameters_INLINE = { variable: ['x', 'y', 'z'], type: 'number', range: { min: -20, max: 20 } }

const myFitnessFunction_INLINE = (sample) => {
    let { x, y, z } = sample
    let desired_output = 10 // Desired function output
    let actual_output = getVector(x, y, z) // Function to optimize parameters on
    let loss = Math.abs(desired_output - actual_output)
    return loss
}

const trainTrainee = (config) => new Promise((resolve, reject) => {
    try {
        const numOfGenerations = config.generations
        const conf = {
            debug: false,
            maxPopulation: config.population,
            survivorsPERCENT: config.survivor_pct,
            crossoverChance: config.crossoverChance,
            mutationChance: config.mutationChance,
            mutationPower: config.mutationPower,
            parameters: mvfBohachevsky2.params, //parameters_INLINE,
            initialValues: initialValues_INLINE,
            fitnessTargetValue: mvfBohachevsky2.targetFitness, // 0,
            fitnessTargetTolerance: 1e-10,
            bestSurvive: true,
            fitnessFunction: mvfBohachevsky2.fn, //myFitnessFunction_INLINE,
            fitnessTimeout: 10000,
        }
        const trainee = new GA()
        trainee.configure(conf).evolve(numOfGenerations)
            .then(result => resolve(result.fitness))
            .catch(reject)
    } catch (e) { reject(e) }
})




// Primary training
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.1162, "crossoverChance": 0.0074, "mutationChance": 0.2643, "mutationPower": 0.00039 } // Fitness:  0.000000003812
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.0852, "crossoverChance": 0.1669, "mutationChance": 0.35094, "mutationPower": 0.00561 } // Fitness:  0.000000000646
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.101, "crossoverChance": 0.0717, "mutationChance": 0.2181, "mutationPower": 0.00204 } // Fitness: -0.000000000448
//const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.134, "crossoverChance": 0.1, "mutationChance": 0.332, "mutationPower": 0.0015 } // Fitness:  0.000000000073
//const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.211, "crossoverChance": 0.1192, "mutationChance": 0.1003, "mutationPower": 0.00051 } // Fitness: -0.000000000061
//const trained_GA_config = { "generations": 10, "population": 95, "survivor_pct": 0.083, "crossoverChance": 0.1, "mutationChance": 0.3128, "mutationPower": 0.06389 }
const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.05, "crossoverChance": 0.1106, "mutationChance": 0.5, "mutationPower": 0.17434000000000002 }

const parameters = [
    { variable: 'generations', type: 'integer', range: { min: 10, max: 10 } },
    { variable: 'population', type: 'integer', range: { min: 100, max: 100 } },
    { variable: 'survivor_pct', type: 'number', range: { min: 0.05, max: 0.5 }, snap: 0.001 },
    { variable: 'crossoverChance', type: 'number', range: { min: 0.0, max: 0.3 }, snap: 0.0001 },
    { variable: 'mutationChance', type: 'number', range: { min: 0.0, max: 0.5 }, snap: 0.0001 },
    { variable: 'mutationPower', type: 'number', range: { min: 0.0, max: 0.5 }, snap: 0.00001 }
]




const logProgress = progress => {
    console.log(progress.message)
}

const logResult = result => { // Final results
    console.log(result.message)
}

const catchError = e => {
    if (e === 'timeout') console.log('Training timeout!')
    else throw e
}

const master = new GA()

const config = {
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
    fitnessFunction: trainTrainee,
    fitnessTimeout: 60000,
}

console.log(`Training the trainer now!`)
master.configure(config).evolve(50, logProgress)
    .then(logResult)
    .catch(catchError)