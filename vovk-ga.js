// Copyright (c) 2020 by J.Vovk <https://github.com/Jozo132>

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

// @ts-check
'use strict'

const { isString } = require("util")

const random = Math.random
const floor = Math.floor
const round = Math.round
const abs = Math.abs
const PI = Math.PI

class TinyPause { constructor(nr_of_calls) { this.call_index = 0; this.nr_of_calls = +nr_of_calls || 10000; }; execute = f => { this.call_index++; if (this.call_index >= this.nr_of_calls) { this.call_index = 0; setTimeout(f, 0); } else f() } }
const sanityPause = new TinyPause(10000).execute
const isPromise = o => !!o && (typeof o === 'object' || typeof o === 'function') && typeof o.then === 'function'
const isValidFitnessResult = x => x >= 0 || x < 0 || isNaN(x)

const chance = pct => random() <= pct
const isArray = a => Array.isArray(a)
const isNumber = n => !isArray(n) && n !== null && (n >= 0 || n < 0)
const constrain = (x, min, max) => x > max ? max : x < min ? min : x
const snapNumber = (n, s) => { const sign = n < 0 ? -1 : 1; n = abs(n); const L = n % s; const output = n - ((L / s <= 0.5) ? L : L - s); return output * sign }

const forEachObj = (o, cb) => Object.keys(o).forEach((k, i) => cb(o[k], k, i))
const cloneChild = original => { let cloned_child = {}; forEachObj(original, (prop, key) => cloned_child[key] = prop); return cloned_child }
const generateChildID = (child, keys) => keys.map(k => child[k]).join('')
const getUniquePopulation = (population, params) => { const result = []; const map = new Map(); const keys = params.map(p => p.variable); for (const child of population) { const id = generateChildID(child, keys); if (!map.has(id)) { map.set(id, true); result.push(child); } } return result }

/** @param {any[]} A * @param {number} [i] */// @ts-ignore
const rotateArray = (A, i) => { const B = A.map(x => x); i = i || 0; for (let x = 1; x <= i; x++) B.shift(B.push(B[0])); return B }
/** @param {any[]} A */
const shuffleArray = A => { const B = A.map(x => x); for (let i = B.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * i); const temp = B[i]; B[i] = B[j]; B[j] = temp } return B }
/** @param {any[]} A * @param {number} [cnt] */
const stirArray = (A, cnt) => { cnt = cnt || 1; const B = A.map(x => x); for (let x = 0; x < cnt; x++) { const i = Math.floor(Math.random() * (B.length - 1)); const j = Math.floor(Math.random() * (B.length - 1)); const temp = B[i]; B[i] = B[j]; B[j] = temp } return B }
const randomOfRange = (min, max) => random() * (max - min) + min
const randomOfRangeInt = (min, max) => round(randomOfRange(min, max))
const randomArrayItem = A => A[randomOfRangeInt(0, A.length - 1)]
const randomArrayItemProb = (A, prob) => { const hashMap = A.map((a, i) => ({ x: a, i: i, p: prob[i] })).sort((a, b) => a.p < b.p ? 1 : -1); const avgSum = hashMap.reduce((p, x) => p + x.p, 0); hashMap.forEach(h => h.p /= avgSum); let index = hashMap.length; const r = random(); let porbSum = 0; while (index > 0 && porbSum < r) { index--; porbSum += hashMap[index].p } return hashMap[index].i }

const padStart = (str, len, def) => { str = str.toString(); while (str.length < len) str = (def || ' ') + str; return str }


/*  Example parameter structures
const exampleParameter_a = {
    variable: 'x',
    type: 'number',
    range: { min: 0, max: 10 },
    snap: 0.000001
}

const exampleParameter_b = {
    variable: 'y',
    type: 'option',
    options: [true, false, null, 'a', 'b', PI]
}
*/


const generateRandomParameter = param => {
    const type = param.type || 'number'
    if (type === 'option') {
        const options = param.options || [0, 1]
        return randomArrayItem(options)
    } else {
        const range = param.range || { min: 0, max: 100 }
        let output = type === 'integer' ? randomOfRangeInt(range.min, range.max) : randomOfRange(range.min, range.max)
        if (param.snap > 0) output = snapNumber(output, param.snap)
        return output
    }
}


const mutate_number = (num, param, options, child_proportional_position) => {
    const sign = chance(0.5) ? 1 : -1
    const range = param.range || { min: 0, max: 100 }
    const snap = param.snap
    const max_width = abs(range.max - range.min)
    const dif = (max_width > 1 ? 1 : max_width) * random() * options.mutation.power * options.proportional_mutation_factor * child_proportional_position * 100
    let output = num + sign * dif
    output = (param.type === 'integer') ? floor(output) : output
    if (snap > 0) output = snapNumber(output, snap)
    output = constrain(output, range.min, range.max)
    return output
}

const mutateParameter = (value, param, options, child_proportional_position) => {
    const m_chance = () => chance(options.mutation.chance)
    const type = param.type || 'number'
    if (type === 'option') {
        const p_options = param.options || [0, 1]
        if (m_chance()) return randomArrayItem(p_options)
        else return value
    } else {
        if (m_chance()) return mutate_number(value, param, options, child_proportional_position)
        else return value
    }
}

const generatePopulation = (generations, options, callback) => {
    let myPopulation = []
    // If this is the first generation ...
    if (generations.length === 0) {
        // Generate new population based on initial parameter values OR random parameter values
        for (let i = 0; i < options.max_population; i++) {
            let child = {}
            options.parameters.forEach(param => {
                child[param.variable] = options.initialParams[param.variable] || generateRandomParameter(param)
            })
            myPopulation.push(child)
        }
    } else {
        let previousBest = generations[generations.length - 1].best
        if (options.bestSurvive) {
            // Retain best parents in new population
            previousBest.forEach(best_child => {
                let child = cloneChild(best_child)
                delete child.__fitness__
                myPopulation.push(child)
            })
            // Fill remaining population with random previous best
            for (let i = previousBest.length - 1; i < options.max_population; i++) {
                let child = cloneChild(randomArrayItem(previousBest))
                delete child.__fitness__
                myPopulation.push(child)
            }
        } else {
            // Generate all new generation based on previous best
            for (let i = 0; i < options.max_population; i++) {
                let child = cloneChild(randomArrayItem(previousBest))
                delete child.__fitness__
                myPopulation.push(child)
            }
        }
    }
    sanityPause.execute(() => callback(myPopulation))
}


const crossoverPopulation = (population, options, callback) => {
    if (options.bestSurvive) {
        // Do crossover only on new population, do not crossover original parents
        let newPopulation = population.slice(options.nrOfSurvivors)
        newPopulation.forEach(child_a => {
            options.parameters.forEach(param => {
                if (chance(options.crossoverChance)) {
                    const child_b = randomArrayItem(newPopulation)
                    const param_a = child_a[param.variable]
                    const param_b = child_b[param.variable]
                    child_a[param.variable] = param_b
                    child_b[param.variable] = param_a
                }
            })
        })
    } else {
        // Do crossover on whole population
        population.forEach(child_a => {
            options.parameters.forEach(param => {
                if (chance(options.crossoverChance)) {
                    const child_b = randomArrayItem(population)
                    const param_a = child_a[param.variable]
                    const param_b = child_b[param.variable]
                    child_a[param.variable] = param_b
                    child_b[param.variable] = param_a
                }
            })
        })
    }
    sanityPause.execute(() => callback(population))
}

const mutatePopulation = (population, options, callback) => {
    if (options.bestSurvive) {
        // Do mutation only on new population, do not mutate original parents
        let newPopulation = population.slice(options.nrOfSurvivors)
        newPopulation.forEach((child, index) => {
            const child_proportional_position = index / newPopulation.length
            options.parameters.forEach(param => {
                child[param.variable] = mutateParameter(child[param.variable], param, options, child_proportional_position)
            })
        })
    } else {
        // Do mutation on whole population
        population.forEach((child, index) => {
            const child_proportional_position = index / population.length
            options.parameters.forEach(param => {
                child[param.variable] = mutateParameter(child[param.variable], param, options, child_proportional_position)
            })
        })
    }
    sanityPause.execute(() => callback(population))
}

const fitnessSort = (target, a, b) => {
    if (a.__failed__) return 1
    if (b.__failed__) return -1

    const A = a.__fitness__
    const B = b.__fitness__

    if (target === +Infinity) return (A < B ? +1 : -1)
    if (target === -Infinity) return (A > B ? +1 : -1)

    const A_dif = abs(target - A)
    const B_dif = abs(target - B)

    return (A_dif > B_dif ? +1 : -1)
}

const fitnessTestPopulationASYNC = (population, options, callback) => {
    // Filter out identical children and only keep uniques
    let uniquePopulation = getUniquePopulation(population, options.parameters)
    let i = 0
    let startTime = +new Date()
    let timeout = false
    let timeout_event = setTimeout(() => {  // In case population fitness check takes too long, return timeout error
        timeout = true
        options.throwTimeout()
        callback(null)
    }, options.fitnessTimeout)
    const onEachFitnessDone = (child, fitness) => {
        i++
        if (options.verbose) console.log(`Child ${padStart(`#${i}`, 5, ' ')} fitness response in ${+new Date() - startTime} ms. Fitness: ${fitness}   Output: ${JSON.stringify(child)}`)
        if (isNumber(fitness)) child.__fitness__ = fitness
        else child.__failed__ = true
        if (i === uniquePopulation.length && !timeout) {
            clearTimeout(timeout_event) // Disable timeout beacuse population fitness check finished in time
            uniquePopulation = uniquePopulation.sort((a, b) => fitnessSort(options.fitnessTargetValue, a, b))
            sanityPause.execute(() => callback(uniquePopulation))
        }
    }

    if (options.verbose) console.log('Testing a population of', uniquePopulation.length)
    uniquePopulation.forEach(child => {
        let gotResponse = false
        const fitnessCallback = result => {
            if (!gotResponse) {
                gotResponse = true
                sanityPause.execute(() => onEachFitnessDone(child, result))
            }
        }
        const fitnessOutput = options.calculateFitness(child, fitnessCallback)
        if (fitnessOutput !== undefined) fitnessCallback(fitnessOutput)
    })
}

const populationSelection = (population, options, callback) => {
    population = population.sort((a, b) => fitnessSort(options.fitnessTargetValue, a, b))
    if (options.verbose) console.log(`Selection top ${options.survivorPercent ? `${(options.survivors * 100)}%  =>  ${options.nrOfSurvivors}/${population.length}` : `${options.survivorPercent}/${population.length}`}`)
    sanityPause.execute(() => callback(population.slice(0, options.nrOfSurvivors)))
}




const EVLOLVE_ONE_GEN = (options, callback) => {
    let startTime = +new Date()
    // 1. Generate population based on parents or initial values or random
    generatePopulation(options.generations, options, new_population => {
        if (options.verbose) console.log('Created population', new_population)
        // 2. Crossover population
        crossoverPopulation(new_population, options, crossover_population => {
            if (options.verbose) console.log('Crossover population', crossover_population)
            // 3. Mutate population
            mutatePopulation(crossover_population, options, mutated_population => {
                if (options.verbose) console.log('Mutated population', mutated_population)
                // 4. Fitness test them
                fitnessTestPopulationASYNC(mutated_population, options, (tested_population, error) => {
                    if (error) throw error
                    if (options.verbose) console.log('Fitness tested population done', tested_population)
                    // 5. Select best
                    populationSelection(tested_population, options, best => {
                        let thisGeneration = {
                            index: options.generations.length + 1,
                            duration: +new Date() - startTime,
                            best: best
                        }
                        if (options.verbose) console.log(`Generation ${thisGeneration.index} finished. Best fitness: ${thisGeneration.best[0].__fitness__}`)

                        // Only remember single best from each past generation, except for the last generation remember all survivors
                        if (options.generations.length > 0) options.generations[options.generations.length - 1].best = [options.generations[options.generations.length - 1].best[0]]

                        options.generations.push(thisGeneration)
                        if (options.generations.length > 5000) options.generations.shift()

                        let new_proportional_mutation_factor = abs(options.fitnessTargetValue - thisGeneration.best[0].__fitness__)
                        if (options.verbose) console.log(`Proportional mutation power changed: ${options.proportional_mutation_factor} => ${new_proportional_mutation_factor}`)

                        let thisBest = cloneChild(thisGeneration.best[0])
                        let fitness = thisBest.__fitness__
                        delete thisBest.__fitness__
                        callback({
                            generation: thisGeneration.index,
                            population: options.max_population,
                            time: thisGeneration.duration,
                            fitness: fitness,
                            parameters: thisBest,
                            proportional_mutation_factor: new_proportional_mutation_factor
                        })
                    })
                })
            })
        })
    })
}

const throwTimeoutDefault = () => console.log('ERROR: Generation check timeout')

class Trainer {
    constructor(config) {
        this.__internal__ = {
            max_population: 100,
            survivorPercent: false,
            survivors: 4,
            fitnessTargetValue: 0,
            fitnessTargetTolerance: 0,
            fitnessTimeout: 10000,
            bestSurvive: true,
            mutation: { chance: 0.5, power: 0.1 },
            crossoverChance: 0.1,
            proportional_mutation_factor: 1.0,
            verbose: false,
            parameters: [],
            initialParams: {},
            calculateFitness: () => 0,
            stopFitness: x => false,
            throwTimeout: () => throwTimeoutDefault(),
            generations: []

        }
        this.configure(config)
    };

    configure = (config) => {
        config = config || {}
        if (config.parameters !== undefined) this.setParameters(config.parameters)
        if (config.debug !== undefined) this.debug(config.debug)
        if (config.initialValues !== undefined) this.initialize(config.initialValues)
        if (config.maxPopulation !== undefined) this.setMaxPopulation(config.maxPopulation)
        if (config.survivors !== undefined) this.setSurvivors(config.survivors)
        if (config.survivorsPERCENT !== undefined) this.setSurvivorsPERCENT(config.survivorsPERCENT)
        if (config.crossoverChance !== undefined) this.setCrossoverChance(config.crossoverChance)
        if (config.mutationChance !== undefined) this.setMutationChance(config.mutationChance)
        if (config.mutationPower !== undefined) this.setMutationPower(config.mutationPower)
        if (config.fitnessTargetValue !== undefined) this.setFitnessTargetValue(config.fitnessTargetValue)
        if (config.bestSurvive !== undefined) this.letBestSurvive(config.bestSurvive)
        if (config.fitnessFunction !== undefined) this.setFitnessFunction(config.fitnessFunction)

        if (config.fitnessTimeoutFunction !== undefined) this.setFitnessTimeout(config.fitnessTimeoutFunction, undefined)
        if (config.fitnessTimeout !== undefined) this.setFitnessTimeout(undefined, config.fitnessTimeout)
    }

    setParameters = (...params) => {
        const inputParameters = isArray(params[0]) ? params[0] : params
        const outputParameters = []
        inputParameters.forEach(param => {
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    if (param.range) generatedParam.range = param.range
                    if (param.snap) generatedParam.snap = param.snap
                    if (param.options) generatedParam.options = param.options
                    outputParameters.push(generatedParam)
                })
            } else {
                outputParameters.push(param)
            }
        })
        this.__internal__.parameters = outputParameters
    }
    setFitnessTargetValue = t => this.__internal__.fitnessTargetValue = t || 0
    setFitnessTargetTolerance = t => this.__internal__.fitnessTargetTolerance = t || 0
    setFitnessTimeout = (callback, to) => { this.__internal__.throwTimeout = callback || this.__internal__.throwTimeout; this.__internal__.fitnessTimeout = to || this.__internal__.fitnessTimeout }
    setMaxPopulation = mp => this.__internal__.max_population = mp || 100
    setSurvivors = s => { this.__internal__.survivors = s || 0; this.__internal__.survivorPercent = false }
    setSurvivorsPERCENT = s => { this.__internal__.survivors = s || 0; this.__internal__.survivorPercent = true }
    setCrossoverChance = c => this.__internal__.crossoverChance = c || 0
    setMutationPower = p => this.__internal__.mutation.power = p || 0
    setMutationChance = c => this.__internal__.mutation.chance = c || 0
    initialize = init => this.__internal__.initialParams = init || {}
    setFitnessFunction = f => this.__internal__.calculateFitness = f || (() => 0)
    setStopFunction = f => this.__internal__.stopFitness = f || (() => false)
    letBestSurvive = s => this.__internal__.bestSurvive = (s || s === undefined ? true : false)
    debug = bool => this.__internal__.verbose = bool ? true : false

    // 1. Generate population based on parents or initial values or random
    // 2. Do crossover
    // 3. Do mutate
    // 4. Do fitness test
    // 5. Select best
    evolveOneGeneration = callback => {
        const nrOfSurvivors = this.__internal__.survivorPercent ? Math.ceil(this.__internal__.survivors * this.__internal__.max_population) : this.__internal__.survivors
        const options = {
            generations: this.__internal__.generations,
            parameters: this.__internal__.parameters,
            initialParams: this.__internal__.initialParams,
            max_population: this.__internal__.max_population,
            survivors: this.__internal__.survivors,
            nrOfSurvivors: nrOfSurvivors,
            survivorPercent: this.__internal__.survivorPercent,
            fitnessTargetValue: this.__internal__.fitnessTargetValue,
            fitnessTargetTolerance: this.__internal__.fitnessTargetTolerance,
            fitnessTimeout: this.__internal__.fitnessTimeout,
            throwTimeout: this.__internal__.throwTimeout,
            crossoverChance: this.__internal__.crossoverChance,
            mutation: this.__internal__.mutation || { chance: 0.1, power: 0.1 },
            proportional_mutation_factor: this.__internal__.proportional_mutation_factor,
            calculateFitness: this.__internal__.calculateFitness,
            bestSurvive: this.__internal__.bestSurvive,
            verbose: this.__internal__.verbose
        }
        EVLOLVE_ONE_GEN(options, result => {
            result.totalTime = result.time
            this.__internal__.proportional_mutation_factor = result.proportional_mutation_factor
            result.finished = true
            callback(result)
        })
    }
    evolve = (generation_count, intermediate_callback, final_callback) => {
        const middleFunction = intermediate_callback || ((x) => { })
        const lastFunction = final_callback || intermediate_callback || (() => { })
        const nrOfSurvivors = this.__internal__.survivorPercent ? Math.ceil(this.__internal__.survivors * this.__internal__.max_population) : this.__internal__.survivors
        const options = {
            generations: this.__internal__.generations,
            parameters: this.__internal__.parameters,
            initialParams: this.__internal__.initialParams,
            max_population: this.__internal__.max_population,
            survivors: this.__internal__.survivors,
            nrOfSurvivors: nrOfSurvivors,
            survivorPercent: this.__internal__.survivorPercent,
            fitnessTargetValue: this.__internal__.fitnessTargetValue,
            fitnessTargetTolerance: this.__internal__.fitnessTargetTolerance,
            fitnessTimeout: this.__internal__.fitnessTimeout,
            throwTimeout: this.__internal__.throwTimeout,
            crossoverChance: this.__internal__.crossoverChance,
            mutation: this.__internal__.mutation || { chance: 0.1, power: 0.1 },
            proportional_mutation_factor: this.__internal__.proportional_mutation_factor,
            calculateFitness: this.__internal__.calculateFitness,
            bestSurvive: this.__internal__.bestSurvive,
            verbose: this.__internal__.verbose
        }
        let cycle = 0;
        let totalTime = 0;
        const iterate = () => {
            cycle++
            EVLOLVE_ONE_GEN(options, result => {
                totalTime += result.time
                result.totalTime = totalTime
                this.__internal__.proportional_mutation_factor = result.proportional_mutation_factor
                if (cycle < generation_count && abs(this.__internal__.fitnessTargetValue - result.fitness) > options.fitnessTargetTolerance && !this.__internal__.stopFitness(result.fitness)) {
                    options.proportional_mutation_factor = result.proportional_mutation_factor
                    result.message = `Gen: ${result.generation.toString().padStart(3, ' ')}  Pop: ${result.population}  PMF: ${result.proportional_mutation_factor.toFixed(3)} finished in ${result.time.toString().padStart(4, ' ')} ms    Best fitness: ${result.fitness >= 0 ? ' ' + result.fitness.toFixed(15) : result.fitness.toFixed(15)} => ${JSON.stringify(result.parameters).substring(0, 150)}`
                    middleFunction(result)
                    iterate()
                } else {
                    result.finished = true
                    result.message = `Gen: ${result.generation.toString().padStart(3, ' ')}  Pop: ${result.population}  PMF: ${result.proportional_mutation_factor.toFixed(3)} finished in ${result.time.toString().padStart(4, ' ')} ms    Best fitness: ${result.fitness >= 0 ? ' ' + result.fitness.toFixed(15) : result.fitness.toFixed(15)} => ${JSON.stringify(result.parameters).substring(0, 150)}`
                    if (lastFunction !== middleFunction) middleFunction(result)
                    result.message = `FINISHED in ${result.totalTime.toString().padStart(4, ' ')} ms    Best fitness: ${result.fitness >= 0 ? ' ' + result.fitness.toFixed(12) : result.fitness.toFixed(12)} => ${JSON.stringify(result.parameters)}`
                    lastFunction(result)
                }
            })
        }
        iterate()
    }
}

module.exports = Trainer