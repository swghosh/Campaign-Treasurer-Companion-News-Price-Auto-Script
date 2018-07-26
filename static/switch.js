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

window.addEventListener('load', function() {
    loaderToggle()
})

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