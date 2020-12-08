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
const db = firebase.firestore();

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let url = tabs[0].url;

    //get valid urls from localStorage
    let valid_urls = localStorage.getItem('valid_urls');
    //if it does not exist, store a list of valid urls that are on the server

    if (valid_urls) {
      console.log('valid_urls exists. Updating...');
      valid_urls = JSON.parse(valid_urls);
      db.collection('Articles')
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach((doc) => {
            const newUrl = doc.data().url;
            if (!valid_urls.includes(newUrl)) {
              valid_urls.push(doc.data().url);
            }
          });
        })
        .then(() => {
          localStorage.setItem('valid_urls', JSON.stringify(valid_urls));
        });
    } else {
      console.log('valid_urls does not exist. Creating...');
      valid_urls = [];
      db.collection('Articles')
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach((doc) => {
            const newUrl = doc.data().url;
            valid_urls.push(newUrl);
          });
        })
        .then(() => {
          localStorage.setItem('valid_urls', JSON.stringify(valid_urls));
        });
    }
    console.log('Setting valid_urls');

    //get history from localStorage
    let history = localStorage.getItem('history');
    //if it does not exist, create an empty one
    history = history ? JSON.parse(history) : [];
    //if the current url is not on there, add it to the history
    if (!history.includes(url) && valid_urls.includes(url)) {
      history.push(url);
    }
    console.log('Setting history');
    localStorage.setItem('history', JSON.stringify(history));
  });
  chrome.tabs.create({ url: 'src/dashboard/dashboard_home.html' });
});
