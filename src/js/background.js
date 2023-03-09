// Make table project - Copyright Abhijit Nandy, 2021 onwards

// background script
console.log("background");

// Main
// When the user starts the Maketable by clicking the icon, then this function executes &
// starts off things.What it does is run popup.html passing the tabId which was clicked by the user.
chrome.action.onClicked.addListener(function(activeTab)
{
    /*chrome.windows.create({
         url: "popup.html", 
         type: "popup" 
    });*/

    (async () => {
        const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
        const params = new URLSearchParams({tabId: activeTab?.id});
        chrome.windows.create({url: 'popup.html?' + params, type: "popup" });
      })();

});