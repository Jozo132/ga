// @ts-check
'use strict'


const getVector = (...a) => {
    let vectors = Array.isArray(a[0]) ? a[0] : a
    let output = 0;
    vectors.forEach(val => output += val * val)
    return Math.sqrt(output)
}


//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.1162, "crossoverChance": 0.0074, "mutationChance": 0.2643, "mutationPower": 0.00039 } // Fitness:  0.000000003812
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.0852, "crossoverChance": 0.1669, "mutationChance": 0.35094, "mutationPower": 0.00561 } // Fitness:  0.000000000646
//const trained_GA_config = { "generations": 100, "population": 1000, "survivor_pct": 0.101, "crossoverChance": 0.0717, "mutationChance": 0.2181, "mutationPower": 0.00204 } // Fitness: -0.000000000448
const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.134, "crossoverChance": 0.1, "mutationChance": 0.332, "mutationPower": 0.0015 } // Fitness:  0.000000000073
//const trained_GA_config = { "generations": 10, "population": 100, "survivor_pct": 0.211, "crossoverChance": 0.1192, "mutationChance": 0.1003, "mutationPower": 0.00051 } // Fitness: -0.000000000061

const myFitnessFunction = (sample, returnFitness) => {
    const inline_max_population = sample.population
    const inline_survivor_pct = sample.survivor_pct
    const inline_crossoverChance = sample.crossoverChancesanityPause
    const inline_mutationChance = sample.mutationChance
    const inline_mutationPower = sample.mutationPower

    //const GA = require('./ga')
    const trainer_INLINE = new GA()

    const initalInput_INLINE = { x: 1, y: 1, z: 1 }

    const myFitnessFunction_INLINE = (sample, returnFitness) => {
        let x = sample.x
        let y = sample.y
        let z = sample.z
        //let kotna_funkcija = Math[sample.random_kotna_funkcija]

        let desired_output = 10 // Desired function output
        let actual_output = getVector(x, y, z) //* kotna_funkcija(y - x) + z// My function 

        let error = desired_output - actual_output
        returnFitness(error)
    }

    trainer_INLINE.setFitnessTargetValue(0)
    //trainer_INLINE.setFitnessTargetTolerance(0.00000000001)



    trainer_INLINE.setParameters({
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
    }/*, {
        variable: 'random_kotna_funkcija',
        type: 'option',
        options: ['sin', 'cos', 'tan']
    }*/)

    trainer_INLINE.debug(false)
    trainer_INLINE.initialize(initalInput_INLINE)


    trainer_INLINE.setMaxPopulation(inline_max_population)
    //trainer.setSurvivors(20)
    trainer_INLINE.setSurvivorsPERCENT(inline_survivor_pct)

    trainer_INLINE.setCrossoverChance(inline_crossoverChance)
    trainer_INLINE.setMutationChance(inline_mutationChance)
    trainer_INLINE.setMutationPower(inline_mutationPower)


    trainer_INLINE.setFitnessFunction(myFitnessFunction_INLINE)
    trainer_INLINE.setFitnessTimeout(() => {  // Throw error if fitness takes too long to calculate
        console.log('TIMEOUT INLINE !')
    }, 10000)

    trainer_INLINE.letBestSurvive(true)

    trainer_INLINE.evolve(trained_GA_config.generations, results => {
        if (results.finished) {
            //console.log(`   -> INCEPTION  Gen: ${`${results.generation}`.padStart(3, ' ')}  Pop: ${results.population}   finished in ${`${results.totalTime}`.padStart(4, ' ')} ms    Best fitness: ${results.fitness >= 0 ? ' ' + results.fitness.toFixed(12) : results.fitness.toFixed(12)} => ${JSON.stringify(results.parameters)}`)
            setTimeout(() =>
                returnFitness(results.fitness)
                , 500) // Return reference value
        }
    })

}



const GA = require('./ga')
const trainer = new GA()

trainer.setParameters({
    variable: 'generations',
    type: 'integer',
    range: { min: trained_GA_config.generations, max: trained_GA_config.generations },
    //snap: 1
}, {
    variable: 'population',
    type: 'integer',
    range: { min: trained_GA_config.population, max: trained_GA_config.population },
    //snap: 1
}, {
    variable: 'survivor_pct',
    type: 'number',
    range: { min: 0.05, max: 0.5 },
    snap: 0.001
}, {
    variable: 'crossoverChance',
    type: 'number',
    range: { min: 0.0, max: 0.3 },
    snap: 0.0001
}, {
    variable: 'mutationChance',
    type: 'number',
    range: { min: 0.0, max: 0.5 },
    snap: 0.0001
}, {
    variable: 'mutationPower',
    type: 'number',
    range: { min: 0.0, max: 0.5 },
    snap: 0.00001
})


trainer.debug(false)

// Train existing inputs and improve them
//trainer.initialize(trained_GA_config)


trainer.setMaxPopulation(500)
//trainer.setSurvivors(3)
// { survivor_pct: 0.143, crossoverChance: 0.1, mutationChance: 0.33, mutationPower: 0.02 }
trainer.setSurvivorsPERCENT(trained_GA_config.survivor_pct)
trainer.setCrossoverChance(trained_GA_config.crossoverChance)
trainer.setMutationChance(trained_GA_config.mutationChance)
trainer.setMutationPower(trained_GA_config.mutationPower)

trainer.setFitnessTargetValue(0)
//trainer.setFitnessTargetTolerance(0.00001)

trainer.setFitnessFunction(myFitnessFunction)
trainer.setFitnessTimeout(() => {  // Throw error if fitness takes too long to calculate
    console.log('TIMEOUT')
}, 100000)

trainer.letBestSurvive(true)

console.log(`Training the trainer now!`)

trainer.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
    }
)