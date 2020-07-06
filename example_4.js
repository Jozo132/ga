// @ts-check
'use strict'

const GA = require('./vovk-ga')
const trainer = new GA()

console.log(`Example 4: String combination optimization`)

const desiredOutput = 'To be or not to be, that is the question.'

const parameters = { variable: 'myMessage', size: desiredOutput.length, type: 'string', options: 'abcdefghijklmonpqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ,.!?-_' }


const fitnessFunction = (sample, /* callback */) => {   // optional async callback
    const { myMessage } = sample
    let correctCharacters = 0
    desiredOutput.split('').forEach((c, i) => {
        if (c === myMessage.split('')[i])
            correctCharacters++;
    })
    const score = correctCharacters / desiredOutput.length
    //callback(score) 
    return score
}

const conf = {
    //debug: false,
    maxPopulation: 2500,
    survivorsPERCENT: 0.02,
    crossoverChance: 0.05,
    mutationChance: 0.01,
    //mutationPower: 0.1,
    bestSurvive: true,
    parameters: parameters,
    //initialValues: { x: 0, y: 0 },
    fitnessFunction: fitnessFunction,
    fitnessTargetValue: 1,
    fitnessTimeout: 10000,
    //fitnessTargetTolerance: 1e-15,
}

const logProgress = progress => {
    console.log(progress.message)
}

const logResult = result => {
    console.log(result.message)
}

const catchError = e => {
    if (e === 'timeout') console.log('Training timeout!')
    else throw e
}

console.log(`Starting training...`)
trainer.configure(conf).evolve(100, logProgress)
    .then(logResult)
    .catch(catchError)