//Detect the button click on the main popup
document.getElementById('test-modal').onclick = function () {
  chrome.runtime.sendMessage({ message: 'Open Modal' });
};

document.getElementById('go-to-dashboard').onclick = function () {
  chrome.runtime.sendMessage({ message: 'Open Dashboard' });
};
