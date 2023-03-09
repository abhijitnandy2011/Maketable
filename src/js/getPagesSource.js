// Make table project - Copyright Abhijit Nandy, 2021 onwards


console.log("TA: Content script will now load...");

jQuery.fn.getPath = function () {
    var current = $(this);
    var path = new Array();
    var realpath = "BODY";
    var maxPathLen = 100;
    var currentPathLen = 0;
    while ($(current).prop("tagName") != "BODY") {
        var index = $(current).parent().find($(current).prop("tagName")).index($(current));
        
        var tagName = $(current).prop("tagName");
        var id = $(current).attr("id");
        var className = $(current).attr("class");
        var selector;
        if (id) {
            selector = "#" + id;
        }
        else if(tagName && className) {
            selector = tagName + "." + className;
        }
        else if(tagName && index) {
            selector = tagName + ":eq(" + index + ")";
            //selector = " > " + name + " :nth-child(" + (index+1) + ") ";
        }
        else {
            console.log("id:", id, "tagName:", tagName, "className:", className, "index:", index, ", $current:", $(current));
            console.error("ERROR")
            break;            
        }
        path.push(selector);
        current = $(current).parent();
        
        ++currentPathLen;
        if (currentPathLen > maxPathLen) {
            console.error("jQuery.fn.getPath: Runaway loop, path length now:", currentPathLen);
            break;
        }
    }
    while (path.length != 0) {
        realpath += " " + path.pop(); // or " > " for chrome JS path convention works too
    }
    return realpath;
}

var g_diff;
var g_suffix;
var g_SelElem;
var g_pathClickedElement;
var g_pathCurrentParent;


document.addEventListener("click", function(e) {
    console.log("TA:click: CALLED");
    showOverlay(false);

    g_diff = "";
    g_suffix = "";

    console.log("TA:click:", document.elementFromPoint(e.clientX, e.clientY) );

    console.log("TA:click: g_SelElem:", g_SelElem);

    g_SelElem = document.elementFromPoint(e.clientX, e.clientY);

    // Immediately-invoked function expression
    /* (function() {
        // Load the script
        const script = document.createElement("script");
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        script.type = 'text/javascript';
        script.addEventListener('load', () => {
        console.log(`jQuery ${$.fn.jquery} has been loaded successfully!`);
        // use jQuery below
        });
        document.head.appendChild(script);
    })();*/


    $(g_SelElem).css('border','1px solid blue');

    console.log("TA:click: p:", $(g_SelElem).parent());
    console.log("TA:click: p.c:", $(g_SelElem).parent().children());

    //$(g_SelElem).parentNode.css('border','1px solid blue');
    //$(g_SelElem).parent().children().css('border','1px solid blue');
    
    /*if (g_path == null) {
        g_path =  $(g_SelElem).getPath();
        console.log("getPath:", $(g_SelElem).getPath());
    }
    else {
        $(g_path).css('border','1px solid green');
        g_path = null;
    }*/

    //console.log('PATH"):', $("BODY DIV:eq(0)  DIV:eq(138)  DIV:eq(0)  MAIN:eq(0)  TURBO-FRAME:eq(0)  DIV:eq(0)  DIV:eq(0)  DIV:eq(0)  DIV:eq(4)  DIV:eq(0)  DIV:eq(46)  DIV:eq(13)  DIV:eq(0)  DIV:eq(5)  DIV:eq(2)  SPAN:eq(0)  A:eq(0)"));

    var p = $(g_SelElem).getPath();
    if (p == undefined || p=="") {
        console.error("TA:click: Bad path, skipping");
        return;
    }
    g_pathClickedElement = p;
    g_pathCurrentParent = g_pathClickedElement;

    console.log("TA:click: g_pathClickedElement:", g_pathClickedElement);
    console.log("TA:click: g_pathCurrentParent:", g_pathCurrentParent);

    console.log("TA:click:", document.elementFromPoint(e.clientX, e.clientY).parentNode );
}, false);


function moveParentUp()
{
    if(!g_pathClickedElement) {
        console.warn("In iframe");
        return;
    }
    
    $(g_pathCurrentParent).css('border','none');
    $(g_pathCurrentParent).children().each(function(i){        
        
        var p = $(this).getPath();
        if (p == undefined || p=="") {
            console.error("moveParentUp: Bad path, skipping");
            return;
        }
        
        childPath = p + g_suffix; //" DIV:eq(2)  SPAN:eq(0)  A:eq(0)";        
        console.log(i + ". childPath old:", childPath);
        $(childPath).css('border','none');        
    });

    var p = $(g_pathCurrentParent).parent().getPath();
    if (p == undefined || p=="") {
        console.error("moveParentUp: Bad path, skipping");
        return;
    }
    g_pathCurrentParent = p;
    console.log("TA:moveParentUp: g_pathCurrentParent:", g_pathCurrentParent);
    $(g_pathCurrentParent).css('border','1px solid green');

    g_suffix = g_diff;
    g_diff = g_pathClickedElement.replace(g_pathCurrentParent, "");
    g_diff = g_diff.trim();
    console.log("g_suffix new:", g_suffix);
    console.log("g_diff new:", g_diff);

    $(g_pathCurrentParent).children().each(function(i){
        var p = $(this).getPath();
        if (p == undefined || p=="") {
            console.error("moveParentUp: Bad path, skipping");
            return;
        }
        childPath = p + " " + g_suffix; //" DIV:eq(2)  SPAN:eq(0)  A:eq(0)";     
        console.log(i + ". childPath new:", childPath);
        $(childPath).css('border','1px solid blue');
    });

    console.log("----------------------------------------------------");
    console.log("P: ", g_pathCurrentParent);
    console.log("S: ", g_suffix);
    console.log("----------------------------------------------------");
}


// ------------------------------------------
function getListOfElementsInnerHTML(pathParent, pathSuffix)
{
    if ($(pathParent)[0] == undefined)   {
        console.warn("Parent element undefined, skipping");
        return;
    }
    
    console.log("pP:", $(pathParent)[0]);
    console.log($(pathParent).children.length);
    
    $(pathParent).children().each(function(i){
        var p = $(this).getPath();
        if (p == undefined || p=="") {
            console.error("getListOfElementsInnerHTML: Bad path, skipping");
            return;
        }
        childPath = p + " " + pathSuffix;
        console.log(i + ". childPath new:", childPath);
        $(childPath).css('border','1px solid pink');

        console.log( $(childPath).text());
        console.log( $(childPath).html());
    });

}





function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}

// These are the properties of the DOM Node(element). The properties include the childNodes property to descend down the tree
// Some of these properties appear as the tag's attributes in the Chrome DevTools 'Elements' tab, some are links to children.
// 'tagName' gives the HTML tag name. 'src' give the path to image etc. The required property names can be set dynamically
// before calling domToObj(), or even passed to it as an arg.

var whitelist = ["id", "tagName", "className", "childNodes", "nextSibling", "nodeValue", "src"];

function domToObj (domEl) {
    
    var obj = {};
    if (domEl) {
        for (let i=0; i<whitelist.length; i++) {
            if (domEl[whitelist[i]] instanceof NodeList) {
                //console.log("Detected type:" + whitelist[i]);
                obj[whitelist[i]] = Array.from(domEl[whitelist[i]]);
                //console.log("obj[whitelist[i]]:" + obj[whitelist[i]].length);
            }
            else {
                obj[whitelist[i]] = domEl[whitelist[i]];
            }
        };
    }
    else {
        console.log("domToObj: domEl is ", domEl);
    }
    return obj;
}

function DOMtoJSONString(container)
{ 
    return JSON.stringify(container, function (name, value) {
        if (name === "") {
            return domToObj(value);
        }
        if (Array.isArray(this)) {
            if (typeof value === "object") {
                return domToObj(value);
            }
            return value;
        }
        if (whitelist.find(x => (x === name)))
            return value;
    })
}


/*
chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});
*/

function showOverlay(bShow)
{
    if (bShow) {
        var div = document.createElement("div");
        div.style.border = "1px solid red";
        //div.style.width = "1080px";
        //div.style.height = "800px";
        div.style.top = 0;
        div.style.left = 0;
        div.style.position = "fixed"
        div.style.height = "100%"
        div.style.width = "100%"
        //div.innerHTML = "Ready to click";
        div.id = "myclicklay";
        div.style.background = "#000";
        div.style.opacity = "0.1";
        div.style.zIndex = "99999";
        document.body.appendChild(div);
    }
    else {
        // Remove overlay
        $("#myclicklay").remove();
    }
}


chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name === AgentNames.BG_AGENT);	

    console.log("TA:onConnect: BG connected:", port.name);

	port.onMessage.addListener(function(msg) {
        console.log("TA:onConnect: msg:", msg);
        if (msg.action === Actions.SHOW_OVERLAY) {
            showOverlay(true);
            //alert("cs: Knock knock!");
            //port.postMessage({question: "Who's there?"});
        }
        else if (msg.action === Actions.HIDE_OVERLAY) {
            showOverlay(false);
            //alert("cs: Knock knock!");
            //port.postMessage({question: "Who's there?"});
        }
        else if (msg.action === Actions.GET_DOC_HTML) {
            //alert("cs: Madame");
            //port.postMessage({question: "Madame who?"});
            port.postMessage({info: "connected", src: DOMtoJSONString(document.firstChild.nextSibling)});
        }
        else if (msg.action === Actions.MOVE_UP) {
            //alert("cs: Madame");
            //port.postMessage({question: "Madame who?"});
            //port.postMessage({info: "connected", src: DOMtoJSONString(document.firstChild.nextSibling)});
            moveParentUp();
        }
        else if (msg.action === Actions.GET_ELEMENTS_INNER_HTML) {
            //alert("cs: Madame");
            //port.postMessage({question: "Madame who?"});
            //port.postMessage({info: "connected", src: DOMtoJSONString(document.firstChild.nextSibling)});
            var responseJSON = getListOfElementsInnerHTML(msg.parent, msg.suffix);
            //port.postMessage({info: "connected", src: DOMtoJSONString(document.firstChild.nextSibling)});
        }
	});
});
