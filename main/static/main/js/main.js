// ********************************************************************************************* //

// MAIN Class
var MAIN = {};

// ********************************************************************************************* //
// MAIN
// contains general functions for the project


/**
 * retrieve cookie by name
 * @param {*} name key of the cookie
 */
MAIN.getCookie = function(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


/**
 * delete cookie by name
 * @param {*} name key of the cookie
 */
MAIN.delete_cookie = function( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// ********************************************************************************************* //

// AJAX Class
var AJAX = {};

// ********************************************************************************************* //
// AJAX
// contain function as well as handler for AJAX requests

/**
 * Prepare arguments for scrapy and send it to the scrapyd server as an AJAX request
 */
AJAX.get_scrapy_results = function(e) {    
    var xhttp   = new XMLHttpRequest();
    var url     = document.getElementById('scraping-url').innerText;
    if (url.indexOf("http://") == -1 && url.indexOf("https://"))
        url = 'http://' + url;    
    var host    = document.getElementById('scraping-host').innerText;
    var xpath   = document.getElementById('scraping-selector').innerText;
    var pid     = document.querySelector('[pid]').getAttribute('pid');    
    var param   = "url=" + url + "&host=" + host + "&xpath=" + xpath + "&pid=" + pid;
    xhttp.open("POST", "/scrapy/", true);
    xhttp.setRequestHeader("X-CSRFToken", document.querySelector('[name="csrfmiddlewaretoken"').value);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(param);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("ajax request successful!");            
        } else {
            console.log("ajax request unsuccessful");
        }
    };       
}


/**
 * add handlers
 */
AJAX.init = function() {    
    document.getElementById('scrapyBTN').addEventListener('click', AJAX.get_scrapy_results);    
}

// ********************************************************************************************* //

AJAX.init();