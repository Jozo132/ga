// @ts-check
'use strict'

let startValue = 1
const targetValue = Math.PI

const GA = require('./ga')
const trainer = new GA()
//trainer.setVerbose(true)

trainer.setParameters({
    variable: 'x',
    type: 'number',
    range: { min: 0, max: 10 },
    snap: 0.0000001
})

trainer.setMaxPopulation(100)
trainer.setNrOfSurvivors(10)

trainer.setMutationChance(0.9)
trainer.setMutationPower(0.5)

// Initial parent parameters
trainer.initialize({ x: startValue })

trainer.setFitnessTargetValue(0) // Target fitness value

trainer.setFitnessFunction(P => {
    let fitness = Math.abs(targetValue - P.x) // Fitness calculation: error from desired value
    return fitness
})

trainer.evolve(100, results => {
    // @ts-ignore
    console.log(`Gen: ${`${results.generation}`.padStart(3, ' ')}    Pop: ${results.population}   finished in ${`${results.time}`.padStart(4, ' ')} ms    Best fitness: ${results.fitness.toFixed(12)} => ${JSON.stringify(results.parameters)}`)
})