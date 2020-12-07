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
  var title = data.title;
  var desc = data.content.substring(0, 200) + '...';
  var read_date = '--/--/--';
  var read_time = '00:00';
  var article_url = data.url;

  var html_str =
    '<div class="article-card">\
    <div class="article-img">\
      <img src="article.jpg" alt="article" />\
    </div>\
    <div class="article-info">\
      <div class="article-title">\
        <h2>' +
    title +
    '</h2>\
      </div>\
      <div class="read-date">\
        <span>' +
    read_time +
    '</span>\
        <span>' +
    read_date +
    '</span>\
      </div>\
      <div class="article-desc">\
        <p>' +
    desc +
    '</p>\
      </div>\
      </div> <div>\
      <div class="article-read-more">\
        <a href="' +
    article_url +
    '">Full article</a>\
      </div>\
    </div>\
  </div>';
  return html_str;
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
