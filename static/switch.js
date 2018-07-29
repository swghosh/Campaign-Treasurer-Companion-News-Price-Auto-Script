var divSwitches = document.querySelectorAll('div.switch')

divSwitches.forEach(function(divSwitch) {
    divSwitch.onclick = function() {
        var state = (this.className == 'switch on')

        this.className = (this.className == 'switch on') ? 'switch off' : 'switch on'
        this.childNodes[1].className = (this.childNodes[1].className == 'inner on') ? 'inner off': 'inner on'

        loaderToggle()
        performTask(this.id, !state)
    }
})

var loader = document.querySelector('div.loader')
function loaderToggle() {
    loader.classList.toggle('off')
}

var status = {}
var dataDiv = document.querySelector('div#data')
var tableView = `<table class="view">

<tr class="sector">
    <td class="sector" colspan="3">
        Switches
    </td>
</tr>
<tr class="stock">
    <td class="name" colspan="2">Update Script One</td>
    <td class="current">
        <div class="switch on" id="scriptA">
            <div class="inner on"></div>
        </div>
    </td>
</tr>
<tr class="stock">
    <td class="name" colspan="2">Update Script Two</td>
    <td class="current">
        <div class="switch off" id="scriptB">
            <div class="inner off"></div>
        </div>
    </td>
</tr>
</table>`
tableView = document.querySelector('table.view')

window.addEventListener('load', function() {
    var statusRequest = new XMLHttpRequest()
    statusRequest.open('GET', '/status')
    statusRequest.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var scriptStatus = JSON.parse(this.responseText)
            loadTables(scriptStatus)
        }
        else if(this.readyState == 4) {
            onError('An error occured. (possibly network issue)')
        }
    }
    statusRequest.send()

    loaderToggle()
})
var loadTables = function(scriptStatus) {
    var scriptNames = Object.keys(scriptStatus)

    var table = document.createElement('table')
    table.className = 'view'

    var trStatusHeading = document.createElement('tr')
    trStatusHeading.className = 'sector'

    var tdStatusHeading = document.createElement('td')
    tdStatusHeading.className = 'sector'
    tdStatusHeading.setAttribute('colspan', 3)
    tdStatusHeading.innerHTML = 'Status'

    trStatusHeading.appendChild(tdStatusHeading)
    table.appendChild(trStatusHeading)

    // individual rows for scripts
    scriptNames.forEach(function(scriptName, index) {
        var trStatus = document.createElement('tr')
        trStatus.className = 'stock'

        var tdFullName = document.createElement('td')
        tdFullName.className = 'name'
        tdFullName.innerHTML = 'Update Script ' + (index + 1)
        var tdStatus = document.createElement('td')
        var state = (scriptStatus[scriptName] == 'running')
        tdStatus.className = 'percentage ' + ((state) ? 'high' : 'low')
        tdStatus.innerHTML = (state) ? '● Running' : '● Not Running'
        var tdShortName = document.createElement('td')
        tdShortName.className = 'current'
        tdShortName.innerHTML = '"' + scriptName + '"'

        trStatus.appendChild(tdFullName)
        trStatus.appendChild(tdStatus)
        trStatus.appendChild(tdShortName)

        table.appendChild(trStatus)
    })

    var trSwitchesHeading = document.createElement('tr')
    trSwitchesHeading.className = 'sector'

    var tdSwitchesHeading = document.createElement('td')
    tdSwitchesHeading.className = 'sector'
    tdSwitchesHeading.setAttribute('colspan', 3)
    tdSwitchesHeading.innerHTML = 'Switches'

    trSwitchesHeading.appendChild(tdSwitchesHeading)
    table.appendChild(trSwitchesHeading)

    // individual rows for switches
    scriptNames.forEach(function(scriptName, index) {
        var trSwitch = document.createElement('tr')
        trSwitch.className = 'stock'

        var tdFullName = document.createElement('td')
        tdFullName.className = 'name'
        tdFullName.setAttribute('colspan', 2)
        tdFullName.innerHTML = 'Update Script ' + (index + 1)
        var state = (scriptStatus[scriptName] == 'running')
        var tdSwitch = document.createElement('td')
        tdSwitch.className = 'current'
        var divSwitch = document.createElement('div')
        divSwitch.className = 'switch ' + ((state) ? 'on' : 'off')
        divSwitch.id = scriptName
        var divInnerSwitch = document.createElement('div')
        divInnerSwitch.className = 'inner ' + ((state) ? 'on' : 'off')
        divSwitch.appendChild(divInnerSwitch)
        tdSwitch.appendChild(divSwitch)

        trSwitch.appendChild(tdFullName)
        trSwitch.appendChild(tdSwitch)

        table.appendChild(trSwitch)
    })

    dataDiv.innerHTML = table.outerHTML
}

var performTask = function(id, state) {
    var statusTd = document.querySelector('td.percentage#' + id)
    statusTd.innerHTML = (state) ? '● Running' : '● Not Running'
    statusTd.className = (state) ? 'percentage high' : 'percentage low'

    setTimeout(loaderToggle, 1500)
}

var onError = function(errorMessage) {
    alert(errorMessage)
    // will reload the page
    window.location = window.location.href
}