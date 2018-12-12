/**
 * Replaces a word by a new word in the given string
 * @param {*} str 
 * @param {*} find 
 * @param {*} replace 
 */
function replaceWord(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

// XPATH Class
var Xpath = {};

// ********************************************************************************************* //
// XPATH

/**
* Gets an XPath for an element which describes its hierarchical location.
* by https://gist.github.com/nfeldman/10792041
*/
Xpath.getElementXPath = function(element)
{
    if (element && element.id)
        return '//*[@id="' + element.id + '"]';
    else
        return Xpath.getXElementTreeXPath(element);
};


Xpath.getElementTreeXPath = function(element)
{
    var paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode)
    {
        var index = 0;
        var hasFollowingSiblings = false;
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
        {
            // Ignore document type declaration.
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

            if (sibling.nodeName == element.nodeName)
                ++index;
        }

        for (var sibling = element.nextSibling; sibling && !hasFollowingSiblings;
            sibling = sibling.nextSibling)
        {
            if (sibling.nodeName == element.nodeName)
                hasFollowingSiblings = true;
        }

        var tagName = (element.prefix ? element.prefix + ":" : "") + element.localName;
        var pathIndex = (index || hasFollowingSiblings ? "[" + (index + 1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }

    return paths.length ? "/" + paths.join("/") : null;
};  
    

Xpath.getXElementTreeXPath = function( element ) {
    var paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for ( ; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode )  {
        var index = 0;

        for ( var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling ) {
            // Ignore document type declaration.
            if ( sibling.nodeType == Node.DOCUMENT_TYPE_NODE ) {
                continue;
            }

            if ( sibling.nodeName == element.nodeName ) {
                    ++index;
            }
        }

        var tagName = element.nodeName.toLowerCase();

        // *always* include the sibling index
        var pathIndex = "[" + (index+1) + "]";

        paths.unshift( tagName + pathIndex );
    }

    return paths.length ? "/" + paths.join( "/") : null;
};

var Css = {};

Css.getCssSelector = function(el){
    if (!(el instanceof Element)) return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
        } else {
            var sib = el, nth = 1;
            while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++);
            selector += ":nth-child("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
}

// ********************************************************************************************* //

var CRAWL = {};

/**
 * ignore certain html tags
 */
function isIgnoredDOMNode( el ) {
    return el.nodeName === "SCRIPT" 
            || el.nodeName === "NOSCRIPT" 
            || el.nodeName === "IFRAME" 
            || el.nodeName === "STYLE"
            || el.nodeName === "LINK"
            || el.nodeName === "META"
            ? true : false;
}

var addMouseover = function(e) {    
    this.style.border = "3px solid rgba(0,200,255,.5)";
    e.stopPropagation();
}

var addMouseout = function(e) {    
    this.style.border = '';
    e.stopPropagation();    
}


/**
 * get xpath of the clicked element as well as innertext, domain und url
 * @param {*} e 
 */
var getXpath = function(e) {        
    e.preventDefault();
    var xpathCur = Xpath.getElementXPath( this );
    var url      = document.body.getAttribute('host');
    var crawltext = this.innerText;
    if (crawltext !== "") {    
        parent.document.getElementById('scraping-element').innerText = this.innerText;
        parent.document.getElementById('scrapyBTN').removeAttribute("disabled");        
    }
    else {
        parent.document.getElementById('scraping-element').innerText = "No text available for crawling";        
        parent.document.getElementById('scrapyBTN').setAttribute("disabled", "disabled");        
    }        
    parent.document.getElementById('scraping-selector').innerText = xpathCur;    
    parent.document.getElementById('scraping-url').innerText = url;
    parent.document.getElementById('scraping-host').innerText = document.body.getAttribute("host");
    e.stopPropagation();
}


/**
 * get xpath of element 
 * @param {*} e 
 */
var xpathCrawl = function(e) {
    e.preventDefault();
    var xpathCur = Xpath.getElementXPath( this );
    parent.document.getElementById('scraping-selector').innerText = xpathCur;    
}


var simCrawl = function(e) {
    console.log(Css.getCssSelector(this));
}


/**
 * enables hyperlinks to work through iframe
 * @param {*} e Event
 */
function navigateInsideFrame(e) {
    var c_host_abs  = document.domain;        
    if (c_host_abs.indexOf("localhost") != -1)
        c_host_abs  = "localhost:8000";            
    
    var d_host = document.body.getAttribute("host");

    e.preventDefault();
    var iFrameWalker    = parent.document.querySelector('#iframe-nav');
    var searchSubmit    = parent.document.querySelector('#iframe-search');
    iFrameWalker.value  = replaceWord(this.href, c_host_abs, d_host);
    searchSubmit.click();
}

/** 
 * recursively traverses html document and adds mouse over as well as click events to each DOM element which is
 * 1. visible
 * 2. has width and height
 * 3. only to current node and NOT children of node
 * The events will enable that on hover the elements get a blue borderline and when you
 * click on the element you get their xpath, innertext, current url and domain
 */
function traverseDOM( el ) {
    var children = el.children;
    
    if ( children.length == 0 ) {
        return 1;
    } else {
        for ( var i = 0; i < children.length; i++ ) {
            var cur = children[i];            
            if ( isIgnoredDOMNode( cur ) ) {
                continue;
            } else {
                cur.classList.toggle('scrapable-element');                
                cur.addEventListener('mouseover', addMouseover );                
                cur.addEventListener('mouseout', addMouseout );                
                cur.addEventListener('click', getXpath );
                cur.addEventListener('click', simCrawl );
                traverseDOM( cur );
            }
        }
    }    
}


/**
 * remove event listener added by function traverseDOM
 */
function traverse() {
    var scrapableElements = document.querySelectorAll( '.scrapable-element' );
    for ( var i = 0; i < scrapableElements.length; i++ ) {
        scrapableElements[i].classList.toggle('scrapable-element');                
        scrapableElements[i].removeEventListener('mouseover', addMouseover );                
        scrapableElements[i].removeEventListener('mouseout', addMouseout );                
        scrapableElements[i].removeEventListener('click', getXpath );
        scrapableElements[i].removeEventListener('click', simCrawl );
    }
}

/**
 * enables switching between on-scraping status (all events are disabled)
 * and off-scraping status (webpage is working like usual)
 */
CRAWL.addHandler = function() {
    var aTags = document.getElementsByTagName('a');
    for (var i = 0; i < aTags.length; i++) {
        aTags[i].addEventListener('click', navigateInsideFrame );
    }

    document.querySelector('#turnOffCrawlBtn').addEventListener('click', function() {        
        // enable scraping; turn off default behaviour of website
        if ( this.classList.contains("document-viewing") ) {
            traverseDOM( document.body );
            var aTags           = document.getElementsByTagName('a');
            for (var i = 0; i < aTags.length; i++) {
                aTags[i].removeEventListener('click', navigateInsideFrame);
            }        
            this.innerText = "Turn off scraping";
            parent.document.getElementById('status').querySelector('.container').style.display = "block";
        } 
        // enable viewing; turn on default behaviour of website
        else {            
            var aTags           = document.getElementsByTagName('a');
            for (var i = 0; i < aTags.length; i++) {
                aTags[i].addEventListener('click', navigateInsideFrame );
            }        
            traverse();
            this.innerText = "Turn on scraping";
            parent.document.getElementById('status').querySelector('.container').style.display = "none";
        }
        this.classList.toggle('document-viewing');
        this.classList.toggle('document-scraping');
    }); 
}


CRAWL.init = function() {
    console.log("Begin crawl.js");
    this.addHandler();
    console.log("End crawl.js");
}

CRAWL.init();