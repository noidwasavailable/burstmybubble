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

function getArticleDiv(data) {
  return (
    '<div class="checklist-box">\
        <div class="title text">' +
    data.title +
    '</div>\
        <div class="text">' +
    data.content.substring(0, 100) +
    ' ...' +
    '\
        </div>\
    </div>'
  );
}

var url_history = localStorage.getItem('history');
var url_history = JSON.parse(url_history);
var articles = [];

db.collection('Articles')
  .where('url', 'in', url_history)
  .get()
  .then(function (querySnapshot) {
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, data: doc.data() });
    });
    // alert(articles.length);
    var div = document.getElementById('history-panel');
    for (var i = articles.length - 1; i >= 0; i--) {
      var data = articles[i].data;
      //   alert(data.title);
      div.innerHTML += getArticleDiv(data);
    }
  });
