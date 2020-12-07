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

//----------------Main process----------------------
window.localStorage.setItem(
  'prev_site',
  'https://www.vox.com/recode/21546119/trump-conspiracy-theories-election-2020-coronavirus-voting-vote-by-mail'
);

console.log(window.localStorage.getItem('prev_site'));
const site_history = JSON.parse(window.localStorage.getItem('history'));
display_survey();
//--------------------------------------------------

// Send the last site visited to server for entity analysis
// Assume that the last visited site was held in the variable "prev_site" in localStorage
function display_survey() {
//   const prev_site = window.localStorage.getItem('prev_site');
const prev_site = site_history[site_history.length-1];
  const req_json = {
    url: prev_site,
  };
  const param_det = {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req_json),
    method: 'POST',
  };
  console.log('Start analyzing...');
  fetch('http://15.164.214.36/analyze-entity', param_det)
    .then((data) => {
      return data.json();
    })
    .then((res) => {
      get_article_id(res.title, prev_site, res.entities.entities);
    });
}

function compareDB(url, entities, curr_article) {
  var curr_id = curr_article.id;
  //Pick 10 entities
  var top_entities = [];
  console.log(entities);
  for (var idx in entities) {
    var entity = entities[idx];
    if (entity.salience > 0.01 && top_entities.length < 10) {
      top_entities.push(entity.name);
    } else {
      break;
    }
  }

  // Get articles with similar entities
  db.collection('Articles')
    .get()
    .then((querySnapshot) => {
      var similar_articles = [];
      querySnapshot.forEach((doc) => {
        var curr_doc = doc.data();
        var found = false;
        for (var idx in curr_doc.entities) {
          var entity = curr_doc.entities[idx];
          for (var j in top_entities) {
            if (
              top_entities[j].includes(entity.name) ||
              entity.name.includes(top_entities[j])
            ) {
              if (doc.id == curr_id) {
                continue;
              }
              var result_doc = {
                doc_id: doc.id,
                doc_url: curr_doc.url,
                saliency: entity.salience,
              };
              similar_articles.push(result_doc);
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
        });
        //Set to 0 as a test; Can be changed into the one with highest saliency
        var choosen_article = null
        for (var similar_article of similar_articles) {
            if (site_history.includes(similar_article.doc_url)) {
                choosen_article = similar_article;
                break;
            }
        }
        if (choosen_article === null) {
            var update_articles = {
                article1: {
                    id: curr_id,
                    data: curr_article.data,
                },
                article2: null
            }
            update_survey(update_articles)
            return
            // Alternative: use random ones
            // var choosen_article = similar_articles[Math.floor(Math.random() * similar_articles.length)]
        }

      // Update the survey page based on the choosen article
      var ref = firebase
        .firestore()
        .collection('Articles')
        .doc(choosen_article.doc_id)
        .get();
      ref.then(function (doc) {
        if (doc.exists) {
          console.log(doc.data());
          console.log(curr_article);
          var update_articles = {
            article1: {
              id: curr_id,
              data: curr_article.data,
            },
            article2: {
              id: choosen_article.doc_id,
              data: doc.data(),
            },
          };
          update_survey(update_articles);
          // window.localStorage.setItem("sim_artc", doc.data().title)
          // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          //   chrome.tabs.sendMessage(tabs[0].id, {type: "ARTICLE", similar_article: {
          //     title: doc.data().title, id: choosen_article.doc_id, curr_id: curr_id, curr_art: curr_article.data, new_article: doc.data()}
          //   });
          // });
        } else {
          // doc.data() will be undefined in this case
          console.log('No such document!');
        }
      });
    });
}

function last_category(categoryName) {
  const tempArray = categoryName.split('/');
  return tempArray[tempArray.length - 1];
}

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

async function get_article_id(title, url, entities) {
  var article_id = [];
  db.collection('Articles')
    .where('title', '==', title)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach((doc) => {
        article_id.push({ id: doc.id, data: doc.data() });
      });
      console.log(article_id);
      if (article_id.length > 0) {
        compareDB(url, entities, article_id[0]);
      } else {
        compareDB(url, entities, 'No article found');
      }
    });
}

function update_survey(articles) {
    if (articles.article2 === null) {
        // If there is no similar article that has been read, include a "There is no recently read articles that is similar" and give recommendation
        
        document.getElementById('article2').innerHTML = "<span class='title'> No recent article found </span><h6> Visit the <span> feed page </span> to explore more articles </h6>"
        document.getElementById('article2').style.border = "0px"
    }
  // Change the titles
  document.getElementById('article1-title').innerHTML =
    articles.article1.data.title;
  document.getElementById('article2-title').innerHTML =
    articles.article2.data.title;
  // Change the categories
  document.getElementById('article1-cat').innerHTML = last_category(
    articles.article1.data.category.name
  );
  document.getElementById('article2-cat').innerHTML = last_category(
    articles.article2.data.category.name
  );
  // Change the sentiment
  var art1_sentiment = classify_sentiment(articles.article1.data.sentiment);
  var art2_sentiment = classify_sentiment(articles.article2.data.sentiment);
  document.getElementById('article1-sentiment').innerHTML =
    art1_sentiment.sentiment;
  document.getElementById('article2-sentiment').innerHTML =
    art2_sentiment.sentiment;
  document
    .getElementById('article1-sentiment')
    .classList.add(art1_sentiment.css_class);
  document
    .getElementById('article2-sentiment')
    .classList.add(art2_sentiment.css_class);

    //Set the survey button
    document.getElementById('yes-similar-button').onclick = function() {
        update_similarity_score("YES", articles.article1.id, articles.article2.id)
    }
    document.getElementById('no-similar-button').onclick = function() {
        update_similarity_score("NO", articles.article1.id, articles.article2.id)
    }
    document.getElementById('not-related-button').onclick = function() {
        update_similarity_score("NOT RELATED", articles.article1.id, articles.article2.id)
    }

    //Set the image source
    document.getElementById("article1-img").src = articles.article1.data.img_url
    document.getElementById("article2-img").src = articles.article2.data.img_url
}

function update_similarity_score(src, article1, article2) {
  console.log('article 2: ' + article2);
  var added_score = 0;
  if (src === 'YES') {
    added_score = 1;
  } else if (src === 'NOT RELATED') {
    added_score = -0.5;
  }
  var art1_ref = db.collection('Articles').doc(article1);
  art1_ref.get().then((doc) => {
    var curr_data = doc.data().scores;
    console.log(typeof curr_data);
    if (curr_data === undefined) {
      var new_score = {
        score: added_score,
        num_survey: 1,
      };
      var new_data = {};
      new_data[article2] = new_score;
      console.log(new_data);
      art1_ref.update({
        scores: new_data,
      });
    } else if (article2 in curr_data) {
      console.log('Article found');
      var curr_score = curr_data[article2];
      var new_score = {
        score:
          (curr_score.score * curr_score.num_survey + added_score) /
          (curr_score.num_survey + 1),
        num_survey: curr_score.num_survey + 1,
      };
      curr_data[article2] = new_score;
      console.log(curr_data);
      art1_ref.update({
        scores: curr_data,
      });
    } else {
      var new_score = {
        score: added_score,
        num_survey: 1,
      };
      curr_data[article2] = new_score;
      art1_ref.update({
        scores: curr_data,
      });
    }
  });
  //Update for the second article
  var art2_ref = db.collection('Articles').doc(article2);
  art2_ref.get().then((doc) => {
    var curr_data = doc.data().scores;
    //   console.log(curr_data)
    if (curr_data === undefined) {
      var new_score = {
        score: added_score,
        num_survey: 1,
      };
      var new_data = {};
      new_data[article1] = new_score;
      art2_ref.update({
        scores: new_data,
      });
    } else if (article1 in curr_data) {
      // console.log("Article found")
      var curr_score = curr_data[article1];
      var new_score = {
        score:
          (curr_score.score * curr_score.num_survey + added_score) /
          (curr_score.num_survey + 1),
        num_survey: curr_score.num_survey + 1,
      };
      curr_data[article1] = new_score;
      // console.log(curr_data)
      art2_ref.update({
        scores: curr_data,
      });
    } else {
      var new_score = {
        score: added_score,
        num_survey: 1,
      };
      curr_data[article1] = new_score;
      art2_ref.update({
        scores: curr_data,
      });
    }
  });
}
