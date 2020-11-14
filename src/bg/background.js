// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//Keep track of the current tab that is active
// var current_tab = null
// chrome.tabs.onActivated.addListener(tab => {
//     current_tab = tab
// })

//Listen to the message that is sent from the foreground
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //If the modal button was clicked, open the comparison modal
  console.log(request)
  if (request.message === 'Open Modal') {
    console.log('Hello?');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log(tabs)
      var current_tab = tabs[0];
      chrome.tabs.get(current_tab.id, (current_tab_info) => {
        if (!/^chrome/.test(current_tab_info.url)) {
          chrome.tabs.insertCSS(null, { file: 'css/extModal.css' });
          chrome.tabs.executeScript(
            null,
            { file: 'src/scripts/launchModal.js' },
            (_) => {
              // console.log(current_tab_info.url)
              chrome.tabs.sendMessage(current_tab.id, {url: current_tab_info.url}, function(resp) {
                console.log(success)
              })
              // console.log('I injected');
            }
          );
        }
      });
    });
  } else if (request.message === 'Open Dashboard') {
    console.log('Dashboard please');
    chrome.tabs.create({ url: 'src/dashboard/dashboard_home.html' });
  }
});
