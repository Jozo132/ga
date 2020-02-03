// @ts-check
'use strict'

const chance = pct => Math.random() <= pct

const randomOfRange = (min, max) => Math.random() * (max - min) + min
const randomOfRangeInt = (min, max) => Math.floor(randomOfRange(min, max))

const randomArrayItem = A => A[randomOfRangeInt(0, A.length - 1)]

const constrain = (x, min, max) => x > max ? max : x < min ? min : x

const snapNumber = (n, s) => {
    let sign = n < 0 ? -1 : 1
    n = Math.abs(n)
    let L = n % s
    let output = n - ((L / s <= 0.5) ? L : L - 1)
    return output * sign
}


const exampleParameter_a = {
    variable: 'x',
    type: 'number',
    range: { min: 0, max: 10 },
    snap: 0.000001
}

const exampleParameter_b = {
    variable: 'y',
    type: 'option',
    options: [true, false, null, 'a', 'b', Math.PI]
}



const generateRandomParameter = param => {
    let type = param.type || 'number'
    if (type === 'option') {
        let options = param.options || [0, 1]
        return randomArrayItem(options)
    } else {
        let range = param.range || { min: 0, max: 100 }
        return type === 'integer' ? randomOfRangeInt(range.min, range.max) : randomOfRange(range.min, range.max)
    }
}



const mutate_number = (num, param, mutation) => {
    let sign = chance(0.5) ? 1 : -1
    let range = param.range || { min: 0, max: 100 }
    let snap = param.snap
    let dif = randomOfRange(range.min, range.max) * mutation.power
    let output = num + sign * dif
    output = (param.type === 'integer') ? Math.floor(output) : output
    if (snap) output = snapNumber(output, snap)
    output = constrain(output, range.min, range.max)
    return output
}

const mutateParameter = (value, param, mutation) => {
    let type = param.type || 'number'
    if (type === 'option') {
        let options = param.options || [0, 1]
        if (chance(mutation.chance)) return randomArrayItem(options)
        else return value
    } else {
        if (chance(mutation.chance)) return mutate_number(value, param, mutation)
        else return value
    }
}

const generatePopulation = (generations, options, callback) => {
    let myPopulation = []
    if (generations.length === 0) {
        for (let i = 0; i < options.max_population; i++) {
            let child = {}
            options.parameters.forEach(param => child[param.variable] = options.initialParams[param.variable] || generateRandomParameter(param))
            myPopulation.push(child)
        }
    } else {
        let previousBest = generations[generations.length - 1].best
        for (let i = 0; i < options.max_population; i++) {
            let child = JSON.parse(JSON.stringify(randomArrayItem(previousBest)))
            delete child.__fitness__
            myPopulation.push(child)
        }
    }
    callback(myPopulation)
}



const mutatePopulation = (population, options, callback) => {
    let output = JSON.parse(JSON.stringify(population))
    output.forEach(child => {
        options.parameters.forEach(param => child[param.variable] = mutateParameter(child[param.variable], param, options.mutation))
    })
    callback(output)
}


const fitnessSort = (target, a, b) => {
    let a_dif = target - a.__fitness__
    let b_dif = target - b.__fitness__
    return a_dif < b_dif ? +1 : -1
}

const fitnessTestPopulation = (population, options, callback) => {
    let output = JSON.parse(JSON.stringify(population))
    output.forEach(child => child.__fitness__ = options.calculateFitness(child))
    output = output.sort((a, b) => fitnessSort(options.fitnessTargetValue, a, b))
    callback(output)
}

const populationSelection = (population, options, callback) => {
    let output = JSON.parse(JSON.stringify(population))
    output = output.sort((a, b) => fitnessSort(options.fitnessTargetValue, a, b))
    callback(output.slice(0, options.nrOfSurvivors))
}




const ONE = (options, callback) => {
    let startTime = +new Date()
    // 1. Generate population based on parents or initial values or random
    generatePopulation(options.generations, options, new_population => {
        if (options.verbose) console.log('Created population', new_population)
        // 2. Mutate population
        mutatePopulation(new_population, options, mutated_population => {
            if (options.verbose) console.log('Mutated population', mutated_population)
            // 3. Fitness test them
            fitnessTestPopulation(mutated_population, options, tested_population => {
                if (options.verbose) console.log('Fitness tested population', tested_population)
                // 4. Select best
                populationSelection(tested_population, options, best => {
                    let thisGeneration = {
                        index: options.generations.length + 1,
                        duration: +new Date() - startTime,
                        population: tested_population,
                        best: best
                    }
                    if (options.verbose) console.log(`Generation ${thisGeneration.index} finished. Best fitness: ${thisGeneration.best[0].__fitness__}`)
                    options.generations.push(thisGeneration)

                    let thisBest = JSON.parse(JSON.stringify(thisGeneration.best[0]))
                    let fitness = thisBest.__fitness__
                    delete thisBest.__fitness__
                    callback({
                        generation: thisGeneration.index,
                        population: options.max_population,
                        time: thisGeneration.duration,
                        fitness: fitness,
                        parameters: thisBest
                    })
                })
            })
        })
    })
}



module.exports = class Model {
    constructor () {
        this.max_population = 100
        this.nrOfSurvivors = 4
        this.fitnessTargetValue = 0
        this.mutation = { chance: 0.1, power: 0.1 }
        this.verbose = false
        this.parameters = []
        this.initialParams = {}
        this.calculateFitness = () => 0

        this.generations = []

        this.previousResults = {
            index: 0,
            population: [],
            best: []
        }
    };

    reset = () => {
        this.generations = []
        this.previousResults = {
            index: 0,
            population: [],
            best: []
        }
    }

    setParameters = params => {
        params = Array.isArray(params) ? params : [params]
        this.parameters = params
    }
    setFitnessTargetValue = t => this.fitnessTargetValue = t || 0
    setMaxPopulation = mp => this.max_population = mp || 100
    setNrOfSurvivors = s => this.nrOfSurvivors = s || 4
    setMutationPower = p => this.mutation.power = p || 0.1
    setMutationChance = c => this.mutation.chance = c || 0.1
    initialize = init => this.initialParams = init || {}
    setFitnessFunction = f => this.calculateFitness = f || (() => 0)
    setVerbose = bool => this.verbose = bool ? true : false

    // 1. Generate population based on parents or initial values or random
    // 2. Mutate population
    // 3. Fitness test them
    // 4. Select best
    evolveOneGeneration = callback => {
        const options = {
            generations: this.generations,
            parameters: this.parameters,
            initialParams: this.initialParams,
            max_population: this.max_population,
            nrOfSurvivors: this.nrOfSurvivors,
            fitnessTargetValue: this.fitnessTargetValue,
            mutation: this.mutation || { chance: 0.1, power: 0.1 },
            calculateFitness: this.calculateFitness,
            verbose: this.verbose
        }
        ONE(options, callback)
    }
    evolve = (generation_count, callback) => {
        const options = {
            generations: this.generations,
            parameters: this.parameters,
            initialParams: this.initialParams,
            max_population: this.max_population,
            nrOfSurvivors: this.nrOfSurvivors,
            fitnessTargetValue: this.fitnessTargetValue,
            mutation: this.mutation || { chance: 0.1, power: 0.1 },
            calculateFitness: this.calculateFitness,
            verbose: this.verbose
        }
        let cycle = 0;
        const iterate = () => {
            cycle++
            ONE(options, result => {
                callback(result)
                if (cycle < generation_count && result.fitness > 0.000000001) iterate()
            })
        }
        iterate()
    }
}