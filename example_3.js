// @ts-check
'use strict'

const GA = require('./ga')

const trainer = new GA()

trainer.setParameters({
    variable: ['x', 'y'],
    type: 'number',
    range: { min: -2, max: 2 },
    snap: 0.01
})


trainer.setMaxPopulation(1000)
trainer.setSurvivorsPERCENT(0.05)


trainer.setCrossoverChance(0.05)
trainer.setMutationChance(0.45)
trainer.setMutationPower(0.1)


trainer.letBestSurvive(true)

const test = (x, y) => {
    const a = 1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)
    const b = 30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x ** 2 + 48 * y - 36 * x * y + 27 * y ** 2)
    const output = a * b
    return output
}

const fitnessFunction = (sample, /* callback */) => {
    //callback(test(sample)) // optional async callback
    const { x, y } = sample
    return test(x, y)
}

trainer.setFitnessTargetValue(3)

trainer.setFitnessFunction(fitnessFunction)

trainer.evolve(100,
    (status) => { // Progress
        console.log(status.message)
    },
    (finalStatus) => { // Final results
        console.log(finalStatus.message)
        const { x, y } = finalStatus.parameters
        console.log(`Test ${test.toString()}    ---> ${test(x, y)}`)
    }
)