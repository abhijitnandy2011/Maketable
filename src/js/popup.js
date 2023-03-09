// Make table project - Copyright Abhijit Nandy, 2021 onwards

/*chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
	  target: { tabId: tab.id },
	  files: ['js/getPagesSource.js']
	});
  });*/

/*chrome.action.onClicked.addListener((tab) => {
	alert("Tab clicked!")
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
			console.log(response.farewell);
		});
	});
});*/

// Save the passed tab id - passed by background.js for running the tab agent in
const tabId = +new URLSearchParams(location.search).get('tabId');
console.log("BA: Tab id:" + tabId);

var g_portTabAgent;


/*chrome.action.onClicked.addListener((tab) => {
	console.log(tab.id);

	var port = chrome.tabs.connect(
		tab.id,
		{name: "knockknock"});

	port.onMessage.addListener(function(msg) {
		if (msg.question === "Who's there?") {
			//alert("pop: Who's there got!");   // cant use alert() in service script
			//port.postMessage({answer: "Madame"});
		}
		else if (msg.question === "Madame who?") {			
			//port.postMessage({answer: "Madame... Bovary"});
		}
		else if (msg.info === "connected") {			
			console.log("Connected!!");
			port.postMessage({joke: "Knock knock"});
		}
	});	

  });*/


 /* function onDocumentReady()
  {
	$("#btnConnect").click(onButtonDoneClicked);
	// $("#btnDone").keypress(async function() {
	//   onButtonDoneClicked()
	// });
	//$("#btnTick").click(onButtonTickClicked);
	//$("#btnClose").click(onButtonCloseClicked);
  
	document.onkeydown = async function(e) {
	  //alert("document.onkeydown: " + e.keyCode)
	  if (e.keyCode == KEYCODE_DONE_BTN) {
		  onButtonDoneClicked()
	  }
	};
  }*/
  


  /*chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request.action == "getSource") {
	  message.innerText = request.source;	  
	  
	  var loginPayload = {"a": 1};
	  //loginPayload.username = document.getElementById('username').value;
	  //loginPayload.password = document.getElementById('password').value;
	  console.log(loginPayload);
  
	  var callback = function (response) {
		  console.log(response);
	  };
	  var handle_error = function (obj, error_text_status){
		  console.log(error_text_status + " " + obj);
	  };
  
	  /*console.log("Really Posting...")
	  $.ajax({
		  url: 'http://localhost/',
		  type: 'POST',
		  success: callback,
		  data: request.source, //JSON.stringify(loginPayload),
		  contentType: 'application/text',
		  error: handle_error
	  });*/
	  
	/*  console.log("Done!")	  
	}
  });
*/


/*
// A copy of this function execs in the tab - it wont have access to any variables in this script
// So msgs have to be used for communication with the extension.
function injectedFunction() {
	document.body.style.backgroundColor = 'orange';
	console.log("Injected function...");
	alert("Yohai!")
}

chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: injectedFunction
	}, function() {
		// If you try and inject into an extensions page or the webstore/NTP you'll get an error
		if (chrome.runtime.lastError) {
		  message.innerText = 'There was an error injecting orange script : \n' + chrome.runtime.lastError.message;
		}
	  });
});
*/


/*
async function getTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}
*/

async function onWindowLoad()
{

	console.log("BA:onWindowLoad: hellooooo");
	
	$("#btnConnect").click(onButtonConnectClicked);  // this ties the event handlers, it does NOT click the button!
	$("#btnUp").click(onButtonUpClicked);
	
	/*var message = document.querySelector('#message');
  
	const id = await getTabId();

	chrome.scripting.executeScript({
		target: {tabId: id, allFrames: true},
		files: [ "js/getPagesSource.js"]
	}, function() {
	// If you try and inject into an extensions page or the webstore/NTP you'll get an error
	if (chrome.runtime.lastError) {
		message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
	}
	});

	chrome.scripting.executeScript({
		target: { tabId: id },
		function: injectedFunction
	}, function() {
		// If you try and inject into an extensions page or the webstore/NTP you'll get an error
		if (chrome.runtime.lastError) {
		message.innerText = 'There was an error injecting orange script : \n' + chrome.runtime.lastError.message;
		}
	});*/


	
	fnGetTable = function(word){
		//alert("ALERT RED!!")
		if (g_portTabAgent) {
			console.log("BA:fnGetTable: messaging Tab agent to show overlay");
			g_portTabAgent.postMessage({action: Actions.SHOW_OVERLAY});
		}
		else {
			console.log("BA:fnGetTable: Running Tab agent");
			onButtonConnectClicked();
		}
	};
	chrome.contextMenus.removeAll(function() {
		chrome.contextMenus.create({
			id: "1",
			title: "Get Table!",
			contexts:["page"],  // ContextType
		}); 
	});
	chrome.contextMenus.onClicked.addListener(fnGetTable); 

}

// Run the tab agent on connect so it can observe user actions within the tab
async function onButtonConnectClicked()
{
	console.log("BA:onButtonConnectClicked: Hi");
	const id = tabId; //await getTabId();

	console.log(id);

	console.log("BA:onButtonConnectClicked: Running Tab Agent from scripts");	

	// Multiple contents scripts can be executed if they have dependencies
	chrome.scripting.executeScript(
		{
			target: {tabId: id, allFrames: true},
			files: [ 
				"js/libs/jquery-latest.min.js", 
				"js/common.js",
				"js/getPagesSource.js"    // <-------tab agent
			]  
		}, 
		function() {
			// If you try and inject into an extensions page or the webstore/NTP you'll get an error
			if (chrome.runtime.lastError) {
				message.innerText = 'BA:onButtonConnectClicked: There was an error injecting script : \n' + chrome.runtime.lastError.message;
			}

			if (g_portTabAgent == null) {
				console.log("Connecting...");
				g_portTabAgent = chrome.tabs.connect(
					id,
					{
						name: AgentNames.BG_AGENT
					});
			}

			if (g_portTabAgent) {
				console.log("Port is valid");
				g_portTabAgent.onMessage.addListener(function(msg) {
					if (msg.question === "Who's there?") {
						//alert("pop: Who's there got!");   // cant use alert() in service script
						//g_portTabAgent.postMessage({answer: "Madame"});
					}
					else if (msg.question === "Madame who?") {			
						//g_portTabAgent.postMessage({answer: "Madame... Bovary"});
					}
					else if (msg.info === "connected") {			
						console.log("BA:onMessage: Connected received from tab!!");
						console.log(JSON.parse(msg.src));		
						//g_portTabAgent.postMessage({joke: "Knock knock"});
					}
				});

				g_portTabAgent.postMessage({action: Actions.SHOW_OVERLAY});
			}
			else {
				console.error("Port is null");
			}
		});  	

}


async function onButtonUpClicked()
{
	if (g_portTabAgent) {
		console.log("Sending UP message");
		g_portTabAgent.postMessage({action: Actions.MOVE_UP});
	}
	else {
		console.error("Port is null");
	}
}


function getListOfElementsInnerHTML(pathParent, pathSuffix)
{
	console.log("onButtonHighlightPathsClicked: clicked");
	g_portTabAgent.postMessage({
		action: Actions.GET_ELEMENTS_INNER_HTML,
		parent: pathParent,
        suffix: pathSuffix
	});
}

window.onload = onWindowLoad;