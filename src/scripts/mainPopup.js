//Detect the button click on the main popup
document.getElementById('test-modal').onclick = function () {
  console.log('Tes');
  chrome.runtime.sendMessage({ message: 'The button was clicked' });
};

const openDashboard = () => {
  console.log('Hello');
};
