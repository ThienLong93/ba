/**
 * Replaces a word by a new word in the given string
 * @param {*} str 
 * @param {*} find 
 * @param {*} replace 
 */
function replaceWord(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
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


/**
 * add blue border over hovered elements
 * @param {*} e 
 */
var addMouseover = function(e) {    
    this.style.border = "3px solid rgba(0,200,255,.5)";
    e.stopPropagation();
}


/**
 * remove blue border when moving out of hovered elements
 * @param {*} e 
 */
var addMouseout = function(e) {    
    this.style.border = '';
    e.stopPropagation();    
}


/**
 * generate a simalar selector for the element
 * @param {*} e 
 */
var simCrawl = function(e) {    
    e.preventDefault();    
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
    parent.document.getElementById('scraping-url').innerText = url;
    parent.document.getElementById('scraping-host').innerText = document.body.getAttribute("host");

    var tagname = this.tagName;        
    var tagname_parent = this.parentNode.tagName;
    var selector = "";

    var reg_exp_headlines = new RegExp("(h|H)[0-9]");

    // similar selector for headlines is the tagname itself
    if ( reg_exp_headlines.test(tagname))     
        parent.document.getElementById('scraping-selector').innerText = tagname;    
    else if ( reg_exp_headlines.test(tagname_parent) )            
        parent.document.getElementById('scraping-selector').innerText = tagname_parent;            
    else 
    {
        // 3 cases:
        // 1. element has an id
        // 2. element has identifiable parent nodes 
        // 3. element has no identifiable parent nodes.
        if ( element_has_id(this) )
            retparent.document.getElementById('scraping-selector').innerText = this.id;
                    
        var parent_node = this.parentNode; 
        while ( parent_node.tagName !== "BODY" ) 
        {
            while ( parent_node.classList.length < 1 && !element_has_id(parent_node) ) 
            {    
                parent_node = parent_node.parentNode;            
            }

            if (parent_node.tagName === "BODY")
                return selector;

            if (parent_node.id !== "")            
                selector = "#" + parent_node.id + selector;            
            else if ( parent_node.classList.length > 0 && parent_node.classList[0] !== "scrapable-element" )            
                selector = " ." + parent_node.classList[0] +  selector;
            else
            {
                selector = " " + parent_node.tagName +  selector;
            }         
            parent_node = parent_node.parentNode               
        }                 
        
        if (this.classList.length > 0 && this.classList[0] !== "scrapable-element")
            parent.document.getElementById('scraping-selector').innerText = selector + ' .' + this.classList[0]            
        else
            parent.document.getElementById('scraping-selector').innerText = selector + ' ' + this.tagName            
    }
    e.stopPropagation();
}


/**
 * checks if the given element has an id
 * @param {*} el a HTML element
 * Return true if element has id otherwise false
 */
function element_has_id(el)
{
    return el.id !== '';
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