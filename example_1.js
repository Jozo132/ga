// @ts-check
'use strict'

const initalInput = {
    //x: 1,
    //y: 1,
    //z: 1
}

const MY_FUNCTION = (x, y, z) => {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
}

const myFitnessFunction = (sample, returnFitness) => {
    let x = sample.x
    let y = sample.y
    let z = sample.z

    let desired_output = Math.PI               // Desired function output
    let actual_output = MY_FUNCTION(x, y, z)   // My function

    let error = desired_output - actual_output
    returnFitness(error)
}



const GA = require('./ga')
const trainer = new GA()

trainer.setParameters({
    variable: 'x',
    type: 'number',
    range: { min: -20, max: 20 },
    //snap: 0.0001
    //snap: 1
}, {
    variable: 'y',
    type: 'number',
    range: { min: -20, max: 20 },
    //snap: 0.0001
    //snap: 1
}, {
    variable: 'z',
    type: 'number',
    range: { min: -20, max: 20 },
    //snap: 0.0001
    //snap: 1
}
    // , {
    //     variable: 'p',
    //     type: 'option',
    //     options: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0]
    // }
)

// trainer.setParameters([, ])

trainer.debug(false) // (optional)

// Initial parent parameters (optional)
trainer.initialize(initalInput)



//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.1162, "crossoverChance": 0.0074, "mutationChance": 0.2643, "mutationPower": 0.00039 } // Fitness:  0.000000003812
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.0852, "crossoverChance": 0.1669, "mutationChance": 0.35094, "mutationPower": 0.00561 } // Fitness:  0.000000000646
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.101, "crossoverChance": 0.0717, "mutationChance": 0.2181, "mutationPower": 0.00204 } // Fitness: -0.000000000448
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.134, "crossoverChance": 0.1, "mutationChance": 0.332, "mutationPower": 0.0015 } // Fitness:  0.000000000073
const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.05, "crossoverChance": 0.2487, "mutationChance": 0.4853, "mutationPower": 0.24856000000000003 }

trainer.setMaxPopulation(100)

trainer.setSurvivorsPERCENT(trained_GA_config.survivor_pct)

trainer.setCrossoverChance(trained_GA_config.crossoverChance)
trainer.setMutationChance(trained_GA_config.mutationChance)
trainer.setMutationPower(0.1)


trainer.setFitnessTargetValue(0)
//trainer.setFitnessTargetTolerance(0.000000000000000001) (optional)

trainer.setFitnessFunction(myFitnessFunction)
trainer.setFitnessTimeout(() => {  // Throw error if fitness takes too long to calculate
    console.log('Training timeout!')
}, 10000)

trainer.letBestSurvive(true)

trainer.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
        console.log(`Test ${MY_FUNCTION.toString()}    ---> ${MY_FUNCTION(finalStatus.parameters)}`)
    }
)