var assert = require('assert')
var events = require('events')

var posters = require('./posters')

const unitTime = 1000   // unit time in ms

class ScriptsControl {
    constructor(scriptsList) {
        assert.equal(scriptsList instanceof Object, true, 'invalid scripts list')

        this.scriptsList = scriptsList
        this.scriptNames = Object.keys(scriptsList)
        
        this.running = false
        this.runningScriptName = ''
        this.currentScriptRun = null
    }

    startScript(scriptName) {
        assert.notStrictEqual(this.scriptsList[scriptName], undefined, 'invalid script name')
        assert.strictEqual(this.currentScriptRun, null, 'there is already a script running, cannot start another unless it stops')

        this.currentScriptRun = new ScriptRun(scriptName, this.scriptsList[scriptName])
        this.currentScriptRun._runner = this

        this.currentScriptRun.start()
        this.running = true
        this.runningScriptName = scriptName
    }

    stopCurrentlyRunningScript() {
        this.currentScriptRun.stop()

        this.running = false
        this.currentScriptRun = null
        this.runningScriptName = ''
    }

    runningScriptFinished() {
        this.running = false
        this.currentScriptRun = null
        this.runningScriptName = ''
    }

    status() {
        return this.scriptNames.map((scriptName) => {
            return {
                name: scriptName,
                running: (this.running) ? ((this.runningScriptName == scriptName) ? true : false) : false
            }
        }).reduce((previousItem, currentItem) => {
            previousItem[currentItem.name] = currentItem.running ? "running" : "not running"
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

        this.masterSwitch = false
    }

    eventsInit() {
        this.jobs.on('finish', () => {
            if(this._runner != null) {
                this._runner.runningScriptFinished()
            }
        })
        this.jobs.on('error', (err) => {
            console.error(err)

            if(this._runner != null) {
                this._runner.runningScriptFinished()
            }
        })
        this.jobs.on('stop', () => {

        })
    }

    start() {
        this.masterSwitch = true

        var runningIndex = 0
        var previousTimeId = 0
        var self = this

        var repeatRecurse = function() {
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