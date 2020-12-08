// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

const project_id = 'burst-my-bubble';
var firebaseConfig = {
  apiKey: 'AIzaSyAly6suzyJiqxMeza422V_ug5mE2x-9scs',
  authDomain: 'burst-my-bubble.firebaseapp.com',
  databaseURL: 'https://burst-my-bubble.firebaseio.com',
  projectId: 'burst-my-bubble',
  storageBucket: 'burst-my-bubble.appspot.com',
  messagingSenderId: '380940710985',
  appId: '1:380940710985:web:ea733e25936879ab4bbb98',
  measurementId: 'G-CBWQ2QYYCE',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();


chrome.browserAction.onClicked.addListener(() => {
  console.log('Dashboard please');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var url = tabs[0].url;
    var history = localStorage.getItem('history');
    var history = history ? JSON.parse(history) : [];
    if (!history.includes(url)) {
      history.push(url);
    }
    localStorage.setItem('history', JSON.stringify(history));
  });
  chrome.tabs.create({ url: 'src/dashboard/dashboard_home.html' });
});
