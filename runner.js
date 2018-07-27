var assert = require('assert')
var events = require('events')

class Runner {
    constructor(scriptsList) {
        assert.equal(scriptsList instanceof Object, true, 'invalid scriptsList')

        this.scriptsList = scriptsList
        this.scriptNames = Object.keys(scriptsList)
        
        this.running = false
        this.runningScriptName = ''
        this.currentScriptRun = null
    }

    startScript(scriptName) {
        assert.notStrictEqual(this.scriptsList[scriptName], undefined, 'invalid script name')

        this.currentScriptRun = new ScriptRun(scriptName, this.scriptsList[scriptName])
        this.currentScriptRun._runner = this

        this.currentScriptRun.start()
        this.runningScriptName = scriptName
    }

    stopCurrentlyRunningScript() {
        this.currentScriptRun.stop()

        this.running = false
        this.currentScriptRun = null
        this.runningScriptName = ''
    }

    runningScriptEnd() {
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

        this.scriptName(scriptName)
        this.script = script
        this._runner = null

        this.tracker = new events.EventEmitter()
    }
    start() {

    }
    stop() {

    }
}

module.exports = Runner;