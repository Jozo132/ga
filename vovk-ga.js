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

const random = Math.random
const floor = Math.floor
const round = Math.round
const abs = Math.abs

const isPromise = o => !!o && (typeof o === 'object' || typeof o === 'function') && typeof o.then === 'function'
const isValidFitnessResult = x => x >= 0 || x < 0 || isNaN(x)

const chance = pct => random() <= pct
const isArray = a => Array.isArray(a)
const isNumber = n => !isArray(n) && n !== null && (n >= 0 || n < 0)
const isString = s => typeof s === 'string'
const constrain = (x, min, max) => x > max ? max : x < min ? min : x
const snapNumber = (n, s) => { const sign = n < 0 ? -1 : 1; n = abs(n); const L = n % s; const output = n - ((L / s <= 0.5) ? L : L - s); return output * sign }

const cloneChild = (original) => {
    const child = {}
    const keys = Object.keys(original)
    const len = keys.length
    for (let i = 0; i < len; i++) {
        const key = keys[i]
        child[key] = original[key]
    }
    return child
}
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
    } else if (type === 'combination') {
        const options = param.options
        const repeat = param.repeat
        let output = []
        if (repeat) for (let i = 0; i < options.length; i++) output.push(randomArrayItem(options))
        else output = shuffleArray(options)
        if (param.start !== undefined && output.includes(param.start))
            output = rotateArray(output, output.indexOf(param.start))
        return output
    } else if (type === 'string') {
        const options = param.options || 'abcdefghijklmnopqrstuvwxyz'.split('')
        const size = param.size || 1
        let output = ''
        for (let i = 0; i < size; i++) output += randomArrayItem(options)
        return output
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
    } else if (type === 'combination') {
        const options = param.options
        const repeat = param.repeat
        let output = value || generateRandomParameter(param)
        for (let i = 0; i < options.length; i++) {
            if (m_chance()) {
                if (repeat) output[i] = randomArrayItem(options)
                else output = stirArray(output, 1)
            }
        }
        if (param.start !== undefined && output.includes(param.start))
            output = rotateArray(output, output.indexOf(param.start))
        return output
    } else if (type === 'string') {
        const p_options = param.options || 'abcdefghijklmnopqrstuvwxyz'.split('')
        const size = param.size || 1
        let output = value || generateRandomParameter(param)
        for (let i = 0; i < size; i++)
            if (m_chance()) {
                const arr = [...output]
                arr[i] = randomArrayItem(p_options)
                output = arr.join('')
            }
        return output
    } else {
        if (m_chance()) return mutate_number(value, param, options, child_proportional_position)
        else return value
    }
}

const generatePopulation = (generations, options) => {
    const myPopulation = []
    // If this is the first generation ...
    if (generations.length === 0) {
        // Generate new population based on initial parameter values OR random parameter values
        for (let i = 0; i < options.max_population; i++) {
            const child = {}
            options.parameters.forEach(param => {
                child[param.variable] = options.initialParams[param.variable] || generateRandomParameter(param)
            })
            myPopulation.push(child)
        }
    } else {
        const previousBest = generations[generations.length - 1].best
        if (options.bestSurvive) {
            // Retain best parents in new population
            previousBest.forEach(best_child => {
                const child = cloneChild(best_child)
                delete child.__fitness__
                myPopulation.push(child)
            })
            // Fill remaining population with random previous best
            for (let i = previousBest.length - 1; i < options.max_population; i++) {
                const child = cloneChild(randomArrayItem(previousBest))
                delete child.__fitness__
                myPopulation.push(child)
            }
        } else {
            // Generate all new generation based on previous best
            for (let i = 0; i < options.max_population; i++) {
                const child = cloneChild(randomArrayItem(previousBest))
                delete child.__fitness__
                myPopulation.push(child)
            }
        }
    }
    if (options.verbose) console.log('Created population', myPopulation)
    return myPopulation
}


const crossoverPopulation = (population, options) => {
    if (options.bestSurvive) {
        // Do crossover only on new population, do not crossover original parents
        const newPopulation = population.slice(options.nrOfSurvivors)
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
    if (options.verbose) console.log('Crossover population', population)
    return population
}

const mutatePopulation = (population, options) => {
    if (options.bestSurvive) {
        // Do mutation only on new population, do not mutate original parents
        const newPopulation = population.slice(options.nrOfSurvivors)
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
    if (options.verbose) console.log('Mutated population', population)
    return population
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


const fitnessTestChildASYNC = async (child, options) => {
    const startTime = +new Date()
    const fitnessOutput = options.calculateFitness(child)
    const fitness = isPromise(fitnessOutput) ? await fitnessOutput : fitnessOutput
    if (!isNumber(fitness)) throw new Error(`Fitness function must return a number (or a promise that resolves to a number) but returned [${typeof fitness}]: "${fitness}"`)
    const duration = +new Date() - startTime
    if (!isValidFitnessResult(fitness)) throw 'Invalid fitness result'
    if (options.verbose) console.log(`Child fitness response in ${duration} ms. Fitness: ${fitness}   Output: ${JSON.stringify(child)}`)
    return fitness
}

const fitnessTestPopulationASYNC = async (population, options) => {
    // Filter out identical children and only keep uniques
    const sequence = options.sequence
    const uniquePopulation = getUniquePopulation(population, options.parameters)
    let timeout = false
    const timeout_event = setTimeout(() => {  // In case population fitness check takes too long, return timeout error
        timeout = true
        throw 'timeout'
    }, options.fitnessTimeout)
    if (options.verbose) console.log('Testing a population of', uniquePopulation.length)
    if (sequence) {
        for (let i = 0; i < uniquePopulation.length; i++) {
            const child = uniquePopulation[i]
            try {
                const fitness = await fitnessTestChildASYNC(child, options)
                child.__fitness__ = fitness
            } catch (e) {
                child.__failed__ = true
            }
            if (timeout) break
        }
    } else { // Parallel
        await Promise.all(uniquePopulation.map(async (child) => {
            try {
                const fitness = await fitnessTestChildASYNC(child, options)
                child.__fitness__ = fitness
            } catch (e) {
                child.__failed__ = true
            }
        }))
    }
    clearTimeout(timeout_event) // Disable timeout beacuse population fitness check finished in time
    if (options.verbose) console.log('Fitness tested population done', uniquePopulation)
    return uniquePopulation
}

const populationSelection = (population, options) => {
    population = population.sort((a, b) => fitnessSort(options.fitnessTargetValue, a, b))
    if (options.verbose) console.log(`Selection top ${options.survivorPercent ? `${(options.survivors * 100)}%  =>  ${options.nrOfSurvivors}/${population.length}` : `${options.survivorPercent}/${population.length}`}`)
    return population.slice(0, options.nrOfSurvivors)
}




const EVOLVE = async (options, progress_callback) => {
    options = options || {}
    const O = options

    O.currentGeneration = O.currentGeneration || 0
    O.maxGenerations = O.maxGenerations > 0 ? O.maxGenerations : 1
    O.totalTime = O.totalTime || 0
    O.generations = O.generations || 1
    O.parameters = O.parameters
    O.initialParams = O.initialParams
    O.max_population = O.max_population || 100
    O.survivors = O.survivors
    O.nrOfSurvivors = O.nrOfSurvivors
    O.survivorPercent = O.survivorPercent
    O.fitnessTargetValue = O.fitnessTargetValue || 0
    O.fitnessTargetTolerance = O.fitnessTargetTolerance || 0
    O.fitnessTimeout = O.fitnessTimeout
    O.stopFitness = O.stopFitness
    O.crossoverChance = O.crossoverChance
    O.mutation = O.mutation || { chance: 0.1, power: 0.1 }
    O.proportional_mutation_factor = O.proportional_mutation_factor
    O.calculateFitness = O.calculateFitness
    O.bestSurvive = O.bestSurvive || true
    O.sequence = O.sequence || false
    O.verbose = O.verbose || false

    if (options.verbose) console.log(options)

    while (true) {
        options.currentGeneration++
        const startTime = +new Date()
        const P1 = await generatePopulation(options.generations, options)
        const P2 = await crossoverPopulation(P1, options)
        const P3 = await mutatePopulation(P2, options)
        const P4 = await fitnessTestPopulationASYNC(P3, options)
        const P5 = await populationSelection(P4, options)

        const thisGeneration = {
            index: options.generations.length + 1,
            duration: +new Date() - startTime,
            best: P5
        }
        if (options.verbose) console.log(`Generation ${thisGeneration.index} finished. Best fitness: ${thisGeneration.best[0].__fitness__}`)
        // Only remember single best from each past generation, except for the last generation remember all survivors
        if (options.generations.length > 0) options.generations[options.generations.length - 1].best = [options.generations[options.generations.length - 1].best[0]]
        options.generations.push(thisGeneration)
        if (options.generations.length > 5000) options.generations.shift()

        const new_proportional_mutation_factor = abs(options.fitnessTargetValue - thisGeneration.best[0].__fitness__)
        if (options.verbose) console.log(`Proportional mutation power changed: ${options.proportional_mutation_factor} => ${new_proportional_mutation_factor}`)

        const thisBest = cloneChild(thisGeneration.best[0])
        const fitness = thisBest.__fitness__
        delete thisBest.__fitness__

        const generationsDone = options.currentGeneration >= options.maxGenerations
        const targetFitnessDone = options.fitnessTargetValue - fitness === 0 || abs(options.fitnessTargetValue - fitness) < options.fitnessTargetTolerance
        const stopFitnessDone = options.stopFitness(fitness)

        const finished = generationsDone || targetFitnessDone || stopFitnessDone

        options.totalTime += thisGeneration.duration;
        options.proportional_mutation_factor = new_proportional_mutation_factor

        const output = {
            finished,
            generation: thisGeneration.index,
            population: options.max_population,
            time: thisGeneration.duration,
            totalTime: options.totalTime,
            fitness: fitness,
            parameters: thisBest,
            proportional_mutation_factor: new_proportional_mutation_factor
        }
        if (options.verbose && finished) console.log('Evolution finished it seems ...')
        if (progress_callback) progress_callback(output)
        if (finished) return output
    }
}


class Trainer {
    /** @param {{ parameters?: any; debug?: boolean; initialValues?: any; maxPopulation?: number; survivors?: number; survivorsPERCENT?: number; crossoverChance?: number; mutationChance?: number; mutationPower?: number; fitnessTargetValue?: number; fitnessTargetTolerance? : number; bestSurvive?: boolean; fitnessFunction?: any; fitnessTimeout?: any; }} [config] */
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
            /** @type { any[] } */
            parameters: [],
            initialParams: {},
            calculateFitness: () => 0,
            stopFitness: x => false,
            sequence: false,
            verbose: false,
            generations: []
        }
        this.configure(config)
    };

    /** @param {{ parameters?: object | Array; sequence?: boolean; debug?: boolean; initialValues?: any; maxPopulation?: number; survivors?: number; survivorsPERCENT?: number; crossoverChance?: number; mutationChance?: number; mutationPower?: number; fitnessTargetValue?: number; fitnessTargetTolerance? : number; bestSurvive?: boolean; fitnessFunction?: any; fitnessTimeout?: any; } | undefined } config */
    configure = (config) => {
        config = config || {}
        if (config.parameters !== undefined) this.setParameters(config.parameters)
        if (config.sequence !== undefined) this.useSequence(config.sequence)
        if (config.debug !== undefined) this.debug(config.debug)
        if (config.initialValues !== undefined) this.initialize(config.initialValues)
        if (config.maxPopulation !== undefined) this.setMaxPopulation(config.maxPopulation)
        if (config.survivors !== undefined) this.setSurvivors(config.survivors)
        if (config.survivorsPERCENT !== undefined) this.setSurvivorsPERCENT(config.survivorsPERCENT)
        if (config.crossoverChance !== undefined) this.setCrossoverChance(config.crossoverChance)
        if (config.mutationChance !== undefined) this.setMutationChance(config.mutationChance)
        if (config.mutationPower !== undefined) this.setMutationPower(config.mutationPower)
        if (config.fitnessTargetValue !== undefined) this.setFitnessTargetValue(config.fitnessTargetValue)
        if (config.fitnessTargetTolerance !== undefined) this.setFitnessTargetTolerance(config.fitnessTargetTolerance)
        if (config.bestSurvive !== undefined) this.letBestSurvive(config.bestSurvive)
        if (config.fitnessFunction !== undefined) this.setFitnessFunction(config.fitnessFunction)
        return this
    }

    setParameters = (...params) => {
        const inputParameters = isArray(params[0]) ? params[0] : params
        const outputParameters = []

        const addNumber = (param) => {
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    if (param.range) generatedParam.range = param.range
                    if (param.snap) generatedParam.snap = param.snap
                    outputParameters.push(generatedParam)
                })
            } else {
                if (param.size > 1) {
                    for (let i = 0; i < param.size; i++) {
                        const generatedParam = { variable: `${param.variable}${i}`, type: param.type }
                        if (param.range) generatedParam.range = param.range
                        if (param.snap) generatedParam.snap = param.snap
                        outputParameters.push(generatedParam)
                    }
                } else outputParameters.push(param)
            }
        }
        const addInteger = (param) => {
            const snap = round(param.snap)
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    if (param.range) generatedParam.range = param.range
                    if (snap) generatedParam.snap = snap
                    outputParameters.push(generatedParam)
                })
            } else {
                if (param.size > 1) {
                    for (let i = 0; i < param.size; i++) {
                        const generatedParam = { variable: `${param.variable}${i}`, type: param.type }
                        if (param.range) generatedParam.range = param.range
                        if (snap) generatedParam.snap = snap
                        outputParameters.push(generatedParam)
                    }
                } else outputParameters.push(param)
            }
        }

        const addOption = (param) => {
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    generatedParam.options = param.options
                    outputParameters.push(generatedParam)
                })
            } else {
                if (param.size > 1) {
                    for (let i = 0; i < param.size; i++) {
                        const generatedParam = { variable: `${param.variable}${i}`, type: param.type }
                        generatedParam.options = param.options
                        outputParameters.push(generatedParam)
                    }
                } else outputParameters.push(param)
            }
        }

        const addCombination = (param) => {
            param.options = isString(param.options) ? param.options.split('') : param.options
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    if (param.options) generatedParam.options = param.options
                    outputParameters.push(generatedParam)
                })
            } else outputParameters.push(param)
        }


        const addString = (param) => {
            param.size = param.size || 1
            param.options = isString(param.options) ? param.options.split('') : param.options
            if (isArray(param.variable)) {
                param.variable.forEach(p => {
                    const generatedParam = { variable: p, type: param.type }
                    generatedParam.size = param.size
                    if (param.options) generatedParam.options = param.options
                    outputParameters.push(generatedParam)
                })
            } else outputParameters.push(param)
        }

        inputParameters.forEach(param => {
            switch (param.type) {
                case 'number': addNumber(param); break;
                case 'integer': addInteger(param); break;
                case 'option': addOption(param); break;
                case 'combination': addCombination(param); break;
                case 'string': addString(param); break;
                default: addNumber(param); break;
            }
        })
        this.__internal__.parameters = outputParameters
    }
    setFitnessTargetValue = t => this.__internal__.fitnessTargetValue = t || 0
    setFitnessTargetTolerance = t => this.__internal__.fitnessTargetTolerance = t || 0
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
    useSequence = bool => this.__internal__.sequence = bool ? true : false

    // 1. Generate population based on parents or initial values or random
    // 2. Do crossover
    // 3. Do mutate
    // 4. Do fitness test
    // 5. Select best
    evolveOneGeneration = () => {
        const nrOfSurvivors = this.__internal__.survivorPercent ? Math.ceil(this.__internal__.survivors * this.__internal__.max_population) : this.__internal__.survivors
        const options = {
            currentGeneration: 0,
            maxGenerations: 1,
            totalTime: 0,
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
            stopFitness: this.__internal__.stopFitness,
            crossoverChance: this.__internal__.crossoverChance,
            mutation: this.__internal__.mutation || { chance: 0.1, power: 0.1 },
            proportional_mutation_factor: this.__internal__.proportional_mutation_factor,
            calculateFitness: this.__internal__.calculateFitness,
            bestSurvive: this.__internal__.bestSurvive,
            verbose: this.__internal__.verbose
        }
        return EVOLVE(options, progress => {
            progress.totalTime = progress.time
            this.__internal__.proportional_mutation_factor = progress.proportional_mutation_factor
        })
    }
    /** @param {number} generation_count * @param {(x: any) => void} [progress_callback] */
    evolve = async (generation_count, progress_callback) => {
        const nrOfSurvivors = this.__internal__.survivorPercent ? Math.ceil(this.__internal__.survivors * this.__internal__.max_population) : this.__internal__.survivors
        const options = {
            currentGeneration: 0,
            maxGenerations: generation_count,
            totalTime: 0,
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
            stopFitness: this.__internal__.stopFitness,
            crossoverChance: this.__internal__.crossoverChance,
            mutation: this.__internal__.mutation || { chance: 0.1, power: 0.1 },
            proportional_mutation_factor: this.__internal__.proportional_mutation_factor,
            calculateFitness: this.__internal__.calculateFitness,
            bestSurvive: this.__internal__.bestSurvive,
            sequence: this.__internal__.sequence,
            verbose: this.__internal__.verbose,
        }
        const logProgress = progress_callback ? ((progress) => {
            progress.message = `Gen: ${progress.generation.toString().padStart(3, ' ')}  Pop: ${progress.population}  PMF: ${progress.proportional_mutation_factor.toFixed(3)} finished in ${progress.time.toString().padStart(4, ' ')} ms    Best fitness: ${progress.fitness >= 0 ? ' ' + progress.fitness.toFixed(15) : progress.fitness.toFixed(15)} => ${JSON.stringify(progress.parameters).substring(0, 150)}`
            progress_callback(progress)
        }) : undefined
        const result = await EVOLVE(options, logProgress)
        result.message = `FINISHED in ${result.totalTime.toString().padStart(4, ' ')} ms    Best fitness: ${result.fitness >= 0 ? ' ' + result.fitness.toFixed(15) : result.fitness.toFixed(15)} => ${JSON.stringify(result.parameters)}`
        return result
    }
}

module.exports = Trainer