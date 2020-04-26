/* Genetic algorithm benchmark
 * 
 * Algorithm test cases to evaluate the functional working of this library
 * 
 * The benchmark examples are based on a paper from 2000:
 *      Title:     ON BENCHMARKING FUNCTIONS FOR GENETIC ALGORITHMS
 *      Authors:   J. G. DIGALAKIS* and K. G. MARGARITIS
 *      Detail:    University of Macedonia, 54046, Thessaloniki, Greece
 */

// @ts-check
'use strict'

// @ts-ignore
const cli_input = require('minimist')(process.argv.slice(2));

const padStart = (str, len, def) => { str = str.toString(); while (str.length < len) str = (def || ' ') + str; return str }
const random = Math.random
const gaussianRand = v => new Array(v > 0 && v < Infinity ? v : 5).fill(0).map(random).reduce((sum, x) => sum += x, 0) / (v > 0 && v < Infinity ? v : 5)
const noise = (mean, stdev) => mean + (2 * gaussianRand() * stdev) - stdev
const round = Math.round
const floor = Math.floor
const ceil = Math.ceil
const sgn = x => x >= 0 ? 1 : -1
const pi = Math.PI
const e = Math.E
const abs = Math.abs
const sin = Math.sin
const cos = Math.cos
const pow = Math.pow
const sqrt = Math.sqrt
const sq = x => x * x
const cu = x => x * x * x
const qu = x => x * x * x * x
const exp = Math.exp


const benchmarks = {
    mvfAckley: {
        info:
            `\tMultivariate test: Ackley function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 30\n` +
            `\tThe global minimum is 0 at point: ( 0, 0 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfAckley`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -30, max: 30 } },
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const n = Object.keys(sample).length
            const f1 = x => x ** 2
            const f2 = x => cos(2 * pi * x)
            const output = -20 * exp(-0.2 * sqrt((1 / n) * (f1(x0) + f1(x1)))) - exp((1 / n) * (f2(x0) + f2(x1))) + 20 + e
            callback(output)
            return output
        }
    },

    mvfBeale: {
        info:
            `\tMultivariate test: Beale function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 4.5\n` +
            `\tThe global minimum is 0 at point: ( 3, 0.5 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfBeale`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -4.5, max: 4.5 } },
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = sq(1.5 - x0 + x0 * x1) + sq(2.25 - x0 + x0 * sq(x1)) + sq(2.625 - x0 + x0 * cu(x1))
            callback(output)
            return output
        }
    },

    mvfBohachevsky1: {
        info:
            `\tMultivariate test: Bohachevsky (1) function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 50\n` +
            `\tThe global minimum is 0 at the zeroth vector: ( 0, 0 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfBohachevsky1`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -50, max: 50 } },
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = sq(x0) + 2 * sq(x1) - 0.3 * cos(3 * pi * x0) - 0.4 * cos(4 * pi * x1) + 0.7
            callback(output)
            return output
        }
    },
    mvfBohachevsky2: {
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
    },

    mvfBooth: {
        info:
            `\tMultivariate test: Booth function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 10\n` +
            `\tThe global minimum is 0 at point: ( 1, 3 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfBooth`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -10, max: 10 } },
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = sq(x0 + 2 * x1 - 7) + sq(2 * x0 + x1 - 5)
            callback(output)
            return output
        }
    },

    mvfBoxBetts: {
        info:
            `\tMultivariate test: Box-Betts exponential quadratic sum\n\n` +
            `\t3-dimensional input with domain:   0.9 ≤ {x1,x3} ≤ 1.2,  9 ≤ x2 ≤ 11.2\n` +
            `\tThe global minimum is 0 at point: ( 1, 10, 1 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.3 --mutPower=100 --crossover=0.15 --function=mvfBoxBetts`,
        params: [
            { variable: ['x1', 'x3'], type: 'number', range: { min: 0.9, max: 1.2 } },
            { variable: 'x2', type: 'number', range: { min: 9, max: 11.2 } }
        ],
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const data = new Array(10).fill(0).map((j, i) => j = i + 1)
            const { x1, x2, x3 } = sample
            const g = j => exp(-0.1 * j * x1) - exp(-0.1 * j * x2) - (exp(-0.1 * j) - exp(-j)) * x3
            const accumulate = (sum, j) => sum += sq(g(j))
            const output = data.reduce(accumulate, 0)
            callback(output)
            return output
        }
    },

    mvfBranin1: {
        info:
            `\tMultivariate test: Branin (1) function\n\n` +
            `\t2-dimensional input with domain:   -5 < x0 ≤ 10,  0 ≤ x1 ≤ 15\n` +
            `\tThe global minimum is 0.398 at points: ( -3.142, 12.275 ), ( 3.142, 2.275 ), ( 9.425, 2.425 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=200 --mutChance=0.25 --mutPower=0.1 --crossover=0.15 --function=mvfBranin1`,
        params: [
            { variable: 'x0', type: 'number', range: { min: -4.9, max: 10 } },
            { variable: 'x1', type: 'number', range: { min: 0, max: 15 } },
        ],
        //default: { x0: -3.142, x1: 12.257 },
        targetFitness: 0.397,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = sq(x1 - ((5.1 * sq(x0)) / (4 * sq(pi))) + (5 * x0) / pi - 6) + 10 * (1 - (1 / (8 * pi))) * cos(x0) + 10
            callback(output)
            return output
        }
    },
    mvfBranin2: {
        info:
            `\tMultivariate test: Branin (2) function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 10\n` +
            `\tThe global minimum is 0 at point: ( 0.402369, 0.287406 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2000 --mutChance=0.25 --mutPower=1000 --crossover=0.15 --function=mvfBranin2`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -10, max: 10 } },
        //default: { x0: 0.402369, x1: 0.287406 },
        //default: { x0: 1.597461, x1: -0.287405 },
        //default: { x0: 0.148695, x1: 0.402086 },
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = sq(1 - 2 * x1 + sin(4 * pi * x1) / 20 - x0) + sq(x1 - sin(2 * pi * x0) / 2)
            callback(output)
            return output
        }
    },

    mvfCamel3: {
        info:
            `\tMultivariate test: three-hump camel back function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 5\n` +
            `\tThe global minimum is 0 at point: ( 0, 0 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2000 --mutChance=0.15 --mutPower=100 --crossover=0.15 --function=mvfCamel3`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -5, max: 5 } },
        default: {},
        targetFitness: 0,
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = 2 * (x0 ** 2) - 1.05 * (x0 ** 4) + (x0 ** 6) / 6 + x0 * x1 + (x1 ** 2)
            callback(output)
            return output
        }
    },
    mvfCamel6: {
        info:
            `\tMultivariate test: six-hump camel back function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 5\n` +
            `\tThe global minimum is -1.0316 at point: ( -0.08983, 0.7126 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2000 --mutChance=0.15 --mutPower=100 --crossover=0.15 --function=mvfCamel6`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -5, max: 5 } },
        default: {},
        targetFitness: -1.0316,
        stopFunction: x => x <= -1.0316, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = (4 - 2.1 * (x0 ** 2) + (x0 ** 4) / 3) * (x0 ** 2) + x0 * x1 + (-4 + 4 * (x1 ** 2)) * (x1 ** 2)
            callback(output)
            return output
        }
    },

    mvfChichinadze: {
        info:
            `\tMultivariate test: Chichinadze function\n\n` +
            `\t2-dimensional input with domain:   -30 < x0 ≤ 30,  -10 ≤ x1 ≤ 10\n` +
            `\tThe global minimum is -42.944387 at point: ( 6.189866, 0.5 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2000 --mutChance=0.25 --mutPower=10 --crossover=0.15 --function=mvfChichinadze`,
        params: [
            { variable: 'x0', type: 'number', range: { min: -30, max: 30 } },
            { variable: 'x1', type: 'number', range: { min: -10, max: 10 } },
        ],
        default: {},
        targetFitness: -42.944387,
        stopFunction: x => x <= -42.944387, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = (x0 ** 2) - 12 * x0 + 11 + 10 * cos(0.5 * pi * x0) + 8 * sin(2.5 * pi * x0) - 0.2 * sqrt(5) / (exp(0.5 * sq(x1 - 0.5)))
            callback(output)
            return output
        }
    },

    mvfColville: {
        info:
            `\tMultivariate test: Colville function\n\n` +
            `\t4-dimensional input with domain: |xi| ≤ 10\n` +
            `\tThe global minimum is 0 at point: ( 1, 1, 1, 1 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2000 --mutChance=0.15 --mutPower=100 --crossover=0.15 --function=mvfColville`,
        params: { variable: ['x0', 'x1', 'x2', 'x3'], type: 'number', range: { min: -10, max: 10 } },
        default: {},
        targetFitness: 0,
        stopFunction: x => x <= 0, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1, x2, x3 } = sample
            const output = 100 * (x0 - x1 ** 2) ** 2 + (1 - x0) ** 2 + 90 * (x3 - x2 ** 2) ** 2 + (1 - x2) ** 2 + 10.1 * ((x1 - 1) ** 2 + (x3 - 1) ** 2) + 19.8 * (x1 - 1) * (x3 - 1)
            callback(output)
            return output
        }
    },

    mvfCorana: {
        info:
            `\tMultivariate test: Corana function\n\n` +
            `\t4-dimensional input with domain: |xi| ≤ 100\n` +
            `\tThe global minimum is 0 at point: ( 1, 1, 1, 1 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=5000 --mutChance=0.15 --mutPower=10 --crossover=0.15 --function=mvfCorana`,
        params: { variable: ['x0', 'x1', 'x2', 'x3'], type: 'number', range: { min: -100, max: 100 } },
        default: {},
        targetFitness: 0,
        stopFunction: x => x <= 0, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const data = Object.keys(sample).map(k => sample[k])
            const d = [1, 1000, 10, 100]
            const getZ = x => 0.2 * floor(abs(x / 0.2) + 0.49999) * sgn(x)
            const accumulate = (sum, x, i) => sum += abs(x - getZ(x)) < 0.05 ? 0.15 * d[i] * sq(getZ(x) - 0.05 * sgn(getZ(x))) : d[i] * sq(x)
            const output = data.reduce(accumulate, 0)
            callback(output)
            return output
        }
    },

    mvfEas90: {
        info:
            `\tMultivariate test: Easom [Eas90] function\n\n` +
            `\t2-dimensional input with domain: |xi| ≤ 100\n` +
            `\tThe global minimum is -1 at point: ( π, π )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2500 --mutChance=0.25 --mutPower=10 --crossover=0.15 --function=mvfEas90`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -100, max: 100 } },
        default: {},
        targetFitness: -1,
        stopFunction: x => x <= -1, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const output = -cos(x0) * cos(x1) * exp(-sq(x0 - pi) - sq(x1 - pi))
            callback(output)
            return output
        }
    },

    mvfEggholder: {
        info:
            `\tMultivariate test: Egg holder function\n\n` +
            `\t2(or n)-dimensional input with domain: |xi| ≤ 512\n` +
            `\tThe global minimum is -959.6407 at point: ( 512, 404.2319 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=500 --mutChance=0.35 --mutPower=1 --crossover=0.15 --function=mvfEggholder`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -512, max: 512 } },
        default: {},
        targetFitness: -959.6407,
        stopFunction: x => x <= -959.6407, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const data = Object.keys(sample).map(k => sample[k])
            const accumulate = (sum, x1, i) => {
                if (i < data.length - 1) {
                    const x2 = data[i + 1] || 0
                    sum += -(x2 + 47) * sin(sqrt(abs(x2 + x1 * 0.5 + 47))) - x1 * sin(sqrt(abs(x1 - (x2 + 47))))
                }
                return sum
            }
            const output = data.reduce(accumulate, 0)
            callback(output)
            return output
        }
    },

    mvfExp2: {
        info:
            `\tMultivariate test: Exp2 function\n\n` +
            `\t2-dimensional input with domain:  0 ≤ xi ≤ 20\n` +
            `\tThe global minimum is 0 at point: ( 1, 10 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=500 --mutChance=0.35 --mutPower=100 --crossover=0.15 --function=mvfExp2`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -0, max: 20 } },
        default: {},
        targetFitness: 0,
        stopFunction: x => x <= 0, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const accumulate = (sum, i) => sum += sq(exp(-i * x0 * 0.1) - 5 * exp(-i * x1 * 0.1) - exp(-i * 0.1) + 5 * exp(-i))
            const output = new Array(10).fill(0).map((x, i) => x = i).reduce(accumulate, 0)
            callback(output)
            return output
        }
    },

    mvfGear: {
        info:
            `\tMultivariate test: Gear function\n\n` +
            `\t2-dimensional input with domain:  12 ≤ xi ≤ 60\n` +
            `\tThe global minimum is 2.7e-12 at point: ( 16, 19, 49, 43 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=25000 --mutChance=0.05 --mutPower=100000000 --crossover=0.15 --function=mvfGear`,
        params: { variable: ['x0', 'x1', 'x2', 'x3'], type: 'number', range: { min: 12, max: 60 } },
        default: {},
        targetFitness: 2.7e-12,
        stopFunction: x => x <= 2.7e-12, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1, x2, x3 } = sample
            const output = sq(1 / 6.931 - floor(x0) * floor(x1) / (floor(x2) * floor(x3)))
            callback(output)
            return output
        }
    },

    mvfGoldsteinPrice: {
        info:
            `\tMultivariate test: Goldstein-Price function\n\n` +
            `\t2-dimensional input with domain:  |xi| ≤ 2\n` +
            `\tThe global minimum is 3 at point: ( 0, -1 )\n\n` +
            `\tExample command:  node benchmark --gen=20 --pop=2500 --mutChance=0.35 --mutPower=10 --crossover=0.15 --function=mvfGoldsteinPrice`,
        params: { variable: ['x0', 'x1'], type: 'number', range: { min: -2, max: 2 } },
        default: {},
        targetFitness: 3,
        stopFunction: x => x <= 3, // Stop evolving when target achieved
        fn: (sample, callback) => {
            callback = callback || (() => { })
            const { x0, x1 } = sample
            const a = 1 + sq(x0 + x1 + 1) * (19 - 14 * x0 + 3 * x0 ** 2 - 14 * x1 + 6 * x0 * x1 + 3 * x1 ** 2)
            const b = 30 + sq(2 * x0 - 3 * x1) * (18 - 32 * x0 + 12 * x0 ** 2 + 48 * x1 - 36 * x0 * x1 + 27 * x1 ** 2)
            const output = a * b
            callback(output)
            return output
        }
    },
}




const trainBenchmarFunction = (BM, options, callback) => {
    callback = callback || (() => { })
    const name = Number.isInteger(BM) ? 'F' + BM : BM
    const bench = typeof name === 'string' ? benchmarks[name] : BM
    options = options || {}
    const GA = require('./ga')
    const trainer = new GA()
    if (bench.info) console.log(`Benchmark info:\n` + bench.info);
    (bench.init || (() => { }))();
    trainer.initialize(bench.default)
    trainer.setParameters(bench.params)
    trainer.setMaxPopulation(options.population || 50)
    //trainer.setSurvivors(3)
    trainer.letBestSurvive(true)
    trainer.setSurvivorsPERCENT(0.05)
    trainer.setCrossoverChance(options.crossover || 0.25)
    trainer.setMutationChance(options.mutationChance || 0.2)
    trainer.setMutationPower(options.mutationPower || 100)
    trainer.setFitnessTargetValue(bench.targetFitness || 0)
    trainer.setFitnessFunction(bench.fn)
    trainer.setStopFunction(bench.stopFunction)
    trainer.setFitnessTimeout(() => {  // Throw error if fitness takes too long to calculate
        console.log('Training timeout!')
    }, 10000)

    //trainer.letBestSurvive(true)
    setTimeout(() => {
        console.log(`Starting benchmark for ${name}`)
        trainer.evolve(options.generations || 10, results => {
            let fitness = +results.fitness
            console.log(`Gen: ${padStart(results.generation, 3, ' ')} Pop: ${results.population} finished in ${padStart(results.time, 4, ' ')} ms    Best fitness: ${fitness >= 0 ? ' ' + fitness.toFixed(9) : fitness.toFixed(9)} ${Object.keys(results.parameters).length < 6 ? `    =>  Best sample: ${JSON.stringify(results.parameters)}` : ''}`)
            if (results.finished) {
                console.log(`GEN ${results.generation} ${results.failed ? 'FAILED' : `FINISHED`} in ${padStart(results.totalTime, 4, ' ')} ms    Best fitness: ${fitness >= 0 ? ' ' + fitness.toFixed(9) : fitness.toFixed(9)}     =>  Best sample: ${JSON.stringify(results.parameters)}`)
                console.log(`Test ${bench.fn.toString()} \nFinal fitness:  ${bench.fn(results.parameters)} `);
                callback(results)
            }
        })
    }, 1000)
}

const info = process.argv.reduce((hasInfo, arg) => hasInfo = hasInfo || (arg === 'info' || arg === 'help' || arg === '?'), false)
let function_input = cli_input['f'] || cli_input['function']
const functionName = isNaN(+function_input) ? function_input : 'F' + function_input
const temp_f = benchmarks[functionName]
if (info) {
    Object.keys(benchmarks).forEach((name, index) => {
        let message = ''
        if (index > 0) message += `-------------------------------------\n`
        const bench = benchmarks[name]
        message += `Benchmark ${index + 1}` + bench.info
        console.log(message)
    })
} else if (temp_f) {
    const name = functionName
    const gens = cli_input['g'] || cli_input['gen'] || cli_input['generations'] || 10
    const pop = cli_input['p'] || cli_input['pop'] || cli_input['population'] || 50
    const crossover = cli_input['c'] || cli_input['cross'] || cli_input['crossover'] || 0.25
    const mutChance = cli_input['mc'] || cli_input['mutChance'] || 0.2
    const mutPower = cli_input['mp'] || cli_input['mutPower'] || 100
    if (name) trainBenchmarFunction(name, { generations: gens, population: pop, mutationChance: mutChance, mutationPower: mutPower, crossover: crossover })
    else throw `Benchmark function name '${cli_input[0]}' doesn't exist, plase use this command '--function=1'`
} else {
    console.log(`Function argument invalid: '${functionName}'. Please add an input argument to this command '--function=1'`)
}