/*
// Let us open a web socket
var wsScheme    = window.location.protocol == "https:" ? "wss" : "ws";
var wsSocket    = new WebSocket(wsScheme + '://127.0.0.1:8000/ws/scrapy/');        

// WebSocket Class
var WEBSOCKET = {};

// ********************************************************************************************* //
// WEBSOCKET

WEBSOCKET.init = function() {

    if ("WebSocket" in window) {
        console.log("WebSocket is supported by your Browser!");
                
         
        wsSocket.onopen = function() {           
           // Web Socket is connected, send data using send()           
           console.log("Message is sent...");
        };
         
        wsSocket.onmessage = function(evt) { 
           var received_msg = evt.data;
           console.log("Message is received... " + received_msg);
        };
         
        wsSocket.onclose = function() { 
           
           // websocket is closed.
           console.log("Connection is closed..."); 
        };
     } else {
       
        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
     }    
}
*/

var MAIN = {};

/**
 * retrieve cookie by name
 * @param {*} name 
 */
MAIN.getCookie = function(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


MAIN.delete_cookie = function( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


MAIN.init = function() {
    
}

// ********************************************************************************************* //

// AJAX Class
var AJAX = {};

// ********************************************************************************************* //
// AJAX

/**
 * Check status and get scrapy results
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
            //wsSocket.send(pid);
        } else {
            console.log("ajax request unsuccessful");
        }
    };       
}

AJAX.init = function() {
    document.getElementById('scrapyBTN').addEventListener('click', AJAX.get_scrapy_results);    
}

// ********************************************************************************************* //

MAIN.init();
AJAX.init();