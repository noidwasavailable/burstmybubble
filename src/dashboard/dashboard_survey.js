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
let site_history = window.localStorage.getItem('history');
site_history = site_history? JSON.parse(site_history): [];
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    display_survey();
    detect_similar_topics();
  }
};
//--------------------------------------------------

// Send the last site visited to server for entity analysis
// Assume that the last visited site was held in the variable "prev_site" in localStorage
function display_survey() {
  //   const prev_site = window.localStorage.getItem('prev_site');
  if (site_history === null || site_history.length === 0) {
    var articles = {
      article1: null,
      article2: null,
    };
    update_survey(articles);
    return;
  }
  const prev_site = site_history[site_history.length - 1];
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
  // fetch('http://15.164.214.36/analyze-entity', param_det)
  //   .then((data) => {
  //     return data.json();
  //   })
  //   .then((res) => {
  //     get_article_id(res.title, prev_site, res.entities.entities);
  //   });

  //TRIAL: get the entity from firebase instead of analyzing it in the server
  db.collection('Articles').where('url', '==', prev_site)
  .get().then(function(querySnapshot) {
    var article = []
    querySnapshot.forEach((doc) => {
      article.push({title: doc.data().title, entities: doc.data().entities});
    });

    if (article.length > 0) {
      get_article_id(article[0].title, prev_site, article[0].entities)
    } else {
      console.log("Not found")
      return
    }
  })
}

// Detect whether 5 articles of the similar topic has been read
async function detect_similar_topics() {
  if (site_history.length > 4) {
    // Get chain checking 
    const last_five_article = site_history.slice(-5)
    var topics = []
    var ids = []
    var similar_score = []
    var sentiments = []
    // Get id for all site_history
    db.collection('Articles')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (last_five_article.includes(doc.data().url)) {
          // For the sentiments
          sentiments.push(classify_sentiment(doc.data().sentiment).sentiment)

          // For the opinion
          ids.splice(last_five_article.indexOf(doc.data().url), 0, doc.id);

          // For the topic
          const tempArray = doc.data().category.name.split('/');
          const categoryName = tempArray[tempArray.length - 1];
          topics.push(categoryName)
        }
      })
      console.log(topics)
      return {ids, querySnapshot, sentiments, topics}
    }).then( res => 
     { console.log(res.ids.slice(-5))
      res.querySnapshot.forEach((doc) => {
        if (res.ids.slice(0,4).includes(doc.id)) {
          const idx = res.ids.slice(0,4).indexOf(doc.id)
          // Get the score between this article and the next article
          console.log(doc.id)
          console.log(res.ids[idx+1])
          similar_score[idx] = doc.data().scores[res.ids[idx+1]].score
        }
      })

      // If all the topics are the same, then send warning
      if (res.topics.every(entry => entry === res.topics[0])) {
        document.getElementById("various-topic").style.border = "1px solid red";
        document.getElementById("various-topic-text").style.textAlign = "left"
        document.getElementById("various-topic-text").innerHTML = 
          "You have been reading 5 articles from the same topic in succession. Click<span id='click-here'> here </span>to get recommendation on different articles";
        document.getElementById("click-here").style.fontWeight = "bold"
        document.getElementById("click-here").style.cursor = "pointer"
        document.getElementById("click-here").onclick = function() {
          window.open('./dashboard_feed.html', '_self');
        }
      }

      // If all similarity score is above 0.8, then send warning
      if (similar_score.every((score) => score > 0.8)) {
        
        document.getElementById("various-opinion").style.border = "1px solid red";
        document.getElementById("various-opinion-text").style.textAlign = "left"
        document.getElementById("various-opinion-text").innerHTML = 
          "You have been reading 5 articles with similar opinion based on our survey. Please try to find other articles with opposing bias by exploring our feed";
      }

      //If there are more than 3 spicy+hot article in last 5 articles, send warning
      var sensationalize = 0
      res.sentiments.forEach((sent) => {
        if (sent === "Spicy" || sent === "Hot") {sensationalize++}
      })
      if (sensationalize >= 3) {
        document.getElementById("various-sentiment").style.border = "1px solid red";
        document.getElementById("various-sentiment-text").style.textAlign = "left"
        document.getElementById("various-sentiment-text").innerHTML = 
          "The last " + sensationalize + " of your articles are labeled as Spicy/Hot. Please proceed with articles with less sensationalized sentiment";
        // document.getElementById("click-here").style.fontWeight = "bold"
        // document.getElementById("click-here").style.cursor = "pointer"
        // document.getElementById("click-here").onclick = function() {
        //   window.open('./dashboard_feed.html', '_self');
        // }
      }
    })
  }
}

function compareDB(url, entities, curr_article) {
  console.log(curr_article);
  var curr_id = curr_article.id;
  //Pick 10 entities
  var top_entities = [];

  for (var idx in entities) {
    var entity = entities[idx];
    if (entity.salience > 0.01 && top_entities.length < 10) {
      top_entities.push(entity.name);
    } else {
      break;
    }
  }

  console.log(top_entities)
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
      //Get the pairing that has been done in survey
      let surveyed_pair = localStorage.getItem('surveyed_pair');
      //if it does not exist, create an empty one
      surveyed_pair = surveyed_pair ? JSON.parse(surveyed_pair) : [];
      var paired_articles = [];
      surveyed_pair.forEach((entry) => {
        if (entry.includes(curr_id)) {
          paired_articles.push(entry[1 - entry.indexOf(curr_id)]);
        }
      });
      var choosen_article = null;
      console.log(similar_articles);
      for (var similar_article of similar_articles) {
        if (
          site_history.includes(similar_article.doc_url) &&
          !paired_articles.includes(similar_article.doc_id)
        ) {
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
          article2: null,
          paired_articles,
        };
        update_survey(update_articles);
        return;
        // Alternative: use random ones
        // var choosen_article = similar_articles[Math.floor(Math.random() * similar_articles.length)]
      }
      // }
      if (choosen_article === null) {
        var update_articles = {
          article1: {
            id: curr_id,
            data: curr_article.data,
          },
          article2: null,
        };
        update_survey(update_articles);
        return;
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
          console.log(choosen_article.doc_id);
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
  if (magnitude > 30) {
    return { sentiment: 'Spicy', css_class: 'sentiment-spicy' };
  } else if (magnitude > 20) {
    return { sentiment: 'Hot', css_class: 'sentiment-hot' };
  } else if (magnitude > 10) {
    return { sentiment: 'Mild', css_class: 'sentiment-mild' };
  } else if (magnitude > 5) {
    return { sentiment: 'Soft', css_class: 'sentiment-soft' };
  } else {
    return { sentiment: 'Bland', css_class: 'sentiment-bland' };
  }
}

async function get_article_id(title, url, entities) {
  console.log(url);
  var article_id = [];
  db.collection('Articles')
    .where('url', '==', url)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach((doc) => {
        article_id.push({ id: doc.id, data: doc.data() });
      });

      if (article_id.length > 0) {
        compareDB(url, entities, article_id[0]);
      } else {
        compareDB(url, entities, 'No article found');
      }
    });
}

function update_survey(articles) {
  console.log(document.getElementById('finding-article'));
  document.getElementById('finding-article').style.display = 'none';
  document.getElementById('article-options').style.display = 'flex';

  let history = localStorage.getItem('history');
  //if it does not exist, create an empty one
  history = history ? JSON.parse(history) : [];
  if (articles.article1 === null) {
    document.getElementById('top-half').innerHTML =
      "<span class='title'> No recent article found. </span><h6> Visit the <span> feed page </span> to explore more articles. </h6>";
    document.getElementById('top-half').style.border = '0px';
    return;
  } else if (
    articles.article2 === null &&
    articles.paired_articles.length > 0 &&
    history.length > 1
  ) {
    //TODO: This condition may still be buggy
    document.getElementById('top-half').innerHTML =
      "<span class='title'> All survey has been answered. </span><h6> Visit the <span> feed page </span> to explore more articles. </h6>";
    document.getElementById('top-half').style.border = '0px';
    return;
  }
  // Change the titles
  document.getElementById('article1-title').innerHTML =
    articles.article1.data.title;
  // Change the categories
  document.getElementById('article1-cat').innerHTML = last_category(
    articles.article1.data.category.name
  );
  // Change the sentiment
  var art1_sentiment = classify_sentiment(articles.article1.data.sentiment);
  document.getElementById('article1-sentiment').innerHTML =
    art1_sentiment.sentiment;
  document
    .getElementById('article1-sentiment')
    .classList.add(art1_sentiment.css_class);

  //Set the image source
  document.getElementById('article1-img').src = articles.article1.data.img_url;

  if (articles.article2 === null) {
    // If there is no similar article that has been read, include a "There is no recently read articles that is similar" and give recommendation

    document.getElementById('article2').innerHTML =
      "<span class='title'> No recent article found. </span><h6> Visit the <span> feed page </span> to explore more articles. </h6>";
    document.getElementById('article2').style.border = '0px';
    return;
  }
  
  document.getElementById('survey-buttons').style.display = 'block';

  // Update the second article card if there is a return value
  // Change the category
  document.getElementById('article2-cat').innerHTML = last_category(
    articles.article2.data.category.name
  );

  // Change the sentiment
  var art2_sentiment = classify_sentiment(articles.article2.data.sentiment);
  document.getElementById('article2-sentiment').innerHTML =
    art2_sentiment.sentiment;
  document
    .getElementById('article2-sentiment')
    .classList.add(art2_sentiment.css_class);

  // Change the title
  document.getElementById('article2-title').innerHTML =
    articles.article2.data.title;

  //Set the survey button
  document.getElementById('yes-similar-button').onclick = function () {
    update_similarity_score('YES', articles.article1.id, articles.article2.id);
  };
  document.getElementById('no-similar-button').onclick = function () {
    update_similarity_score('NO', articles.article1.id, articles.article2.id);
  };
  document.getElementById('not-related-button').onclick = function () {
    update_similarity_score(
      'NOT RELATED',
      articles.article1.id,
      articles.article2.id
    );
  };

  // Change the article image
  document.getElementById('article2-img').src = articles.article2.data.img_url;
}

function update_similarity_score(src, article1, article2) {
  var added_score = 0;
  if (src === 'YES') {
    added_score = 1;
  } else if (src === 'NOT RELATED') {
    added_score = -0.5;
  }
  var art1_ref = db.collection('Articles').doc(article1);
  art1_ref.get().then((doc) => {
    var curr_data = doc.data().scores;
    if (curr_data === undefined) {
      var new_score = {
        score: added_score,
        num_survey: 1,
      };
      var new_data = {};
      new_data[article2] = new_score;

      art1_ref.update({
        scores: new_data,
      });
    } else if (article2 in curr_data) {
      var curr_score = curr_data[article2];
      var new_score = {
        score:
          (curr_score.score * curr_score.num_survey + added_score) /
          (curr_score.num_survey + 1),
        num_survey: curr_score.num_survey + 1,
      };
      curr_data[article2] = new_score;

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

  // Update the UI to indicate survey has been answered
  document.getElementById('top-half').innerHTML =
    "<span class='title'> Thank you for answering the survey. </span> </h6>";
  document.getElementById('top-half').style.border = '0px';
  // Insert the pair to "surveyed_pair" to keep track of pairing that has been surveyed
  //get history from localStorage
  let surveyed_pair = localStorage.getItem('surveyed_pair');
  //if it does not exist, create an empty one
  surveyed_pair = surveyed_pair ? JSON.parse(surveyed_pair) : [];
  // Add the pair into the survey_pair
  var this_pair = [article1, article2];
  surveyed_pair.push(this_pair);
  console.log('Setting surveyed_pair');
  localStorage.setItem('surveyed_pair', JSON.stringify(surveyed_pair));
}
