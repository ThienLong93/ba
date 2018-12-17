// Links Class
var Links = {};

// ********************************************************************************************* //
// RELATIVE & ABSOLUTE URL TESTING & CONVERTING

/**
 * Checks if the given url contains the host in it
 * @param {*} host 
 * @param {*} url 
 */
function containsHost(host, url) {
    return url.indexOf(host) != -1 ? true : false;
}

/**
 * Replaces a word by a new word in the given string
 * @param {*} str 
 * @param {*} find 
 * @param {*} replace 
 */
function replaceWord(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

/**
 * retrieve cookie by name
 * @param {*} name 
 */
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


// ********************************************************************************************* //

/**
 * convert all relative paths of a linktype to absolute paths
 */
Links.convertLinksToAbsolute = function(p_linktype) {    
    var c_host_abs  = document.domain;
    var c_host_rel  = document.domain;
    var link_atr    = true;
    if (c_host_abs.indexOf("localhost") != -1) {        
        c_host_abs  = "localhost:8000";
        c_host_rel  = "localhost:8000/static/main/tmp";
    } else 
        c_host_rel      = c_host_rel + "static/main/tmp"
    console.log("Hostname of call site abs: " + c_host_abs);
    console.log("Hostname of call site rel: " + c_host_rel);
    
    var d_host = document.body.getAttribute("host");
    console.log("Hostname of target: " + d_host);     
    var d_path = document.body.getAttribute("path")
    console.log("Pathname of target: " + d_path);
    var path_ar = d_path.split('/');
    for (var i = 0; i < path_ar.length; i++)
        console.log(path_ar[i]);


    // determine type of links
    
    if (p_linktype === "stylesheets")
        var linkscol  = document.getElementsByTagName("link"); // get stylesheets
    else if(p_linktype === "scripts") {    
        var linkscol  = document.getElementsByTagName("script"); // get scripts
        link_atr = false;
    }
    else if(p_linktype === "images") {
        var linkscol  = document.getElementsByTagName("img"); // get images
        link_atr = false;
    }
    else if(p_linktype === "hyperlinks")
        var linkscol  = document.getElementsByTagName("a"); // get hyperlinks        
    else // not supported yet
        var linkscol  = document.links; // get all embedded links            
    
    for (var i = 0; i < linkscol.length; i++) { 
        var link = linkscol[i];
        // take href attribute if its a stylesheet
        // otherwise take src
        if (link_atr)
            var url = link.href;
        else
            var url = link.src;        
        console.log("<------- URL: " + url + " -------->");
        if (url != null && url !== "") {            
            console.log("\tOld url: " + url);
            // replace all occurences of localhost:8000 or localhost:8000/static/main/tmp with the target domain
            if (containsHost(c_host_rel, url))
                var n_url = replaceWord(url, c_host_rel, d_host);                            
            else if (containsHost(c_host_abs, url))
                var n_url = replaceWord(url, c_host_abs, d_host);                            
            else
                var n_url = url;                            
            console.log("\tNew url: " + n_url);  
            
            // set href/src attribute for link
            if (link_atr)
                link.href = n_url;
            else
                link.src = n_url;
        }
    }
}


/**
 * all functions to run from this script
 */
Links.init = function() {    
    console.log("Starting transformation of links");
    this.convertLinksToAbsolute("stylesheets");
    this.convertLinksToAbsolute("scripts");
    this.convertLinksToAbsolute("images");
    this.convertLinksToAbsolute("hyperlinks");
    console.log("Ending transformation of links");
}

Links.init();