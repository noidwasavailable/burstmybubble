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

function classify_sentiment(sent_score) {
  const magnitude = sent_score.magnitude;
  const score = sent_score.score;
  if (magnitude > 40) {
    return { sentiment: 'Spicy', css_class: 'sentiment-spicy' };
  } else if (magnitude > 25) {
    return { sentiment: 'Hot', css_class: 'sentiment-hot' };
  } else if (magnitude > 15) {
    return { sentiment: 'Mild', css_class: 'sentiment-mild' };
  } else if (magnitude > 5) {
    return { sentiment: 'Soft', css_class: 'sentiment-soft' };
  } else {
    return { sentiment: 'Bland', css_class: 'sentiment-bland' };
  }
}

function getArticleDiv(data) {
  var title = data.title;
  var desc = data.content.substring(0, 200) + '...';
  var article_url = data.url;
  var img_url = data.img_url;
  var tempArray = data.category.name.split('/');
  var categoryName = tempArray[tempArray.length - 1];
  var sentiment = classify_sentiment(data.sentiment);

  var html_str = `<div class="feed__article">
    <div class="feed__article-img">
        <img src="${img_url}" alt="article" />
    </div>
    <div class="feed__article-content">
        <div class="article-title">${title}</div>
        <div class = "article-info">${categoryName} | <span class="${sentiment.css_class}">${sentiment.sentiment}</span></div>
    </div>
    <a class="article-link" href = "${article_url}"></a>
</div>`;

  return html_str;
}

function getTopicDiv(topic) {
  let html_articles = '';
  articles.forEach((article) => {
    if (article.data.category) {
      const tempArray = article.data.category.name.split('/');
      const categoryName = tempArray[tempArray.length - 1];

      if (categoryName === topic) {
        html_articles += getArticleDiv(article.data);
      }
    } else {
      return;
    }
  });

  const html_str = `<div class="feed__topic">
  <div class="feed__topic-title" id="${topic}">Topic: ${topic}</div>
  <span class="feed__icon-left material-icons"> navigate_before </span>
  <span class="feed__icon-right material-icons"> navigate_next </span>
  <div class="feed__articles" id="feedArticlesJs">${html_articles}</div>
</div>`;

  return html_str;
}

let articles = [];
let categoryList = [];

db.collection('Articles')
  //   .where('url', 'in', url_history)
  .get()
  .then(function (querySnapshot) {
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, data: doc.data() });
    });
    return articles;
  })
  .then((articles) => {
    articles.forEach((article) => {
      if (article.data.category) {
        const tempArray = article.data.category.name.split('/');
        const categoryName = tempArray[tempArray.length - 1];
        if (categoryList.includes(categoryName)) {
          return;
        } else {
          categoryList.push(categoryName);
        }
      } else {
        return;
      }
    });
    return categoryList;
  })
  .then((categoryList) => {
    // console.log(categoryList);
    const feed = document.getElementById('feedJs');
    categoryList.forEach((categoryName) => {
      feed.innerHTML += getTopicDiv(categoryName);
    });
  });
// categoryList
// alert(articles.length);
// var div = document.getElementById('feedArticlesJs');
