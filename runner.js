var assert = require('assert')
var events = require('events')

var posters = require('./posters')
posters.differenceNewsAndPriceUpdate = parseInt(process.env.CTC_DIFF_NEWS_PRICE)

const unitTime = parseInt(process.env.CTC_UNIT_TIME)   // unit time in ms

class ScriptsControl {
    constructor(scriptsList) {
        assert.equal(scriptsList instanceof Object, true, 'invalid scripts list')

        this.scriptsList = scriptsList
        this.scriptNames = Object.keys(scriptsList)
        
        this.running = false
        this.finished = false
        this.runningScriptName = ''
        this.lastRuntScriptName = ''
        this.currentScriptRun = null
    }

    startScript(scriptName) {
        assert.notStrictEqual(this.scriptsList[scriptName], undefined, 'invalid script name')
        assert.strictEqual(this.currentScriptRun, null, 'there is already a script running, cannot start another unless it stops')

        this.currentScriptRun = new ScriptRun(scriptName, this.scriptsList[scriptName])
        this.currentScriptRun.assignScriptsControl(this)

        this.currentScriptRun.start()
        this.running = true
        this.finished = false
        this.runningScriptName = scriptName
    }

    stopCurrentlyRunningScript() {
        if(this.currentScriptRun != null) {
            this.currentScriptRun.stop()
        }

        this.running = false
        this.currentScriptRun = null

        this.lastRuntScriptName = this.runningScriptName
        this.runningScriptName = ''
    }

    runningScriptFinished() {
        this.running = false
        this.finished = true
        this.currentScriptRun = null

        this.lastRuntScriptName = this.runningScriptName
        this.runningScriptName = ''
    }

    status() {
        return this.scriptNames.map((scriptName) => {
            return {
                name: scriptName,
                running: (this.running) ? ((this.runningScriptName == scriptName) ? true : false) : false,
                finished: (this.finished) ? ((this.lastRuntScriptName == scriptName) ? true : false) : false
            }
        }).reduce((previousItem, currentItem) => {
            previousItem[currentItem.name] = currentItem.running ? "running" : (currentItem.finished ? "finished" : "not running")
            return previousItem
        }, {})
    }
}

class ScriptRun {
    constructor(scriptName, script) {
        assert.equal(typeof scriptName, 'string', 'invalid script name')
        assert.equal(script instanceof Array, true, 'invalid script')

        this.scriptName = scriptName
        this.script = script
        this._runner = null

        this.jobs = new events.EventEmitter()
        this.eventsInit()

        this.progressPercentage = 0

        this.masterSwitch = false
    }

    assignScriptsControl(runner) {
        this._runner = runner
    }

    updateProgress(runningIndex) {
        this.progressPercentage = (runningIndex / this.script.length) * 100
    }

    eventsInit() {
        this.jobs.on('start', () => {
            console.log(`[${new Date().toString()}] started ${this.scriptName}.`)
        })
        this.jobs.on('finish', () => {
            console.log(`[${new Date().toString()}] finished with ${this.scriptName}.`)
            if(this._runner != null) {
                this._runner.runningScriptFinished()
            }
        })
        this.jobs.on('error', (err) => {
            console.log(`[${new Date().toString()}] error occured at ${this.scriptName}.`)
            console.error(err)

            if(this._runner != null) {
                this._runner.runningScriptFinished()
            }
        })
        this.jobs.on('stop', () => {
            console.log(`[${new Date().toString()}] stopped ${this.scriptName}, ${this.progressPercentage}% rolled.`)            
        })
    }

    start() {
        this.masterSwitch = true

        var runningIndex = 0
        var previousTimeId = 0
        var self = this

        var repeatRecurse = function() {
            self.updateProgress(runningIndex)

            var currentScriptItem = self.script[runningIndex]
            
            if(self.masterSwitch) {
                if(runningIndex < self.script.length) {
                    setTimeout(() => {
                        posters.chainUpdate(currentScriptItem, () => {})

                        repeatRecurse()
                    }, (currentScriptItem.timeId - previousTimeId) * unitTime)

                    previousTimeId = currentScriptItem.timeId
                    runningIndex++
                }
                else {
                    self.jobs.emit('finish')
                }
            }
            else {
                self.jobs.emit('stop')
            }
        }

        this.jobs.emit('start')
        repeatRecurse()
    }

    stop() {
        this.masterSwitch = false
    }
}

module.exports = {
    ScriptsControl: ScriptsControl,
    ScriptRun: ScriptRun
}
