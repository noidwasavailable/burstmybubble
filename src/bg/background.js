// if you checked "fancy-settings" in extensionizr.com, uncomment this lines


const project_id = "burst-my-bubble"
var firebaseConfig = {
  apiKey: "AIzaSyAly6suzyJiqxMeza422V_ug5mE2x-9scs",
  authDomain: "burst-my-bubble.firebaseapp.com",
  databaseURL: "https://burst-my-bubble.firebaseio.com",
  projectId: "burst-my-bubble",
  storageBucket: "burst-my-bubble.appspot.com",
  messagingSenderId: "380940710985",
  appId: "1:380940710985:web:ea733e25936879ab4bbb98",
  measurementId: "G-CBWQ2QYYCE"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

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
              const req_json = {
                url: current_tab_info.url
              }
              const param_det = {
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(req_json),
                method: "POST",
              }
              console.log("Start analyzing...")
              fetch('http://15.164.214.36/analyze-entity', param_det).then(
                  data => {return data.json()}
              ).then(res => {
                  get_article_id(res.title, current_tab_info.url, res.entities.entities)
              })
              console.log('I injected');
            }
          );
        }
      });
    });
  } else if (request.message === 'Open Dashboard') {
    console.log('Dashboard please');
    chrome.tabs.create({ url: 'src/dashboard/dashboard_home.html' });
  } else if (request.message === 'Update Similarity Score') {
    console.log("Update message received")
    // console.log(request)
    update_similarity_score(request.src, request.article1, request.article2)
  }
  return true;
});


function compareDB(url, entities, curr_article) {
  var curr_id = curr_article.id
  //Pick 10 entities 
  var top_entities = []
  console.log(entities)
  for (var idx in entities) {
    var entity = entities[idx]
    if (entity.salience > 0.01 && top_entities.length < 10) {
      top_entities.push(entity.name) 
    } else {
      break;
    }
  }
  console.log(top_entities)
  db.collection("Articles").get().then((querySnapshot) => {
      var similar_articles = []
      querySnapshot.forEach((doc) => {
        // console.log(`${doc.id} => ${doc.data()}`);
        var curr_doc = doc.data()
        // console.log(curr_doc.entities)
        for (var idx in curr_doc.entities) {
          // console.log(idx)
          var entity = curr_doc.entities[idx]
          // console.log(entity)
          for (var j in top_entities) {
            if (top_entities[j].includes(entity.name) || entity.name.includes(top_entities[j])) {
              // console.log(`${doc.id} => ${doc.data()}. Entity: ${entity.name}`);
              var result_doc = {
                doc_id: doc.id,
                saliency: entity.salience
              }
              similar_articles.push(result_doc)
            }
          }
        }
      });
      console.log(similar_articles)
      //Set to 0 as a test; Can be changed into the one with highest saliency
      var choosen_article = null
      for (var i in similar_articles) {
        if (similar_articles[i].doc_id !== curr_id) {
          choosen_article = similar_articles[i]
          break
        }
      }

      var ref = firebase.firestore().collection('Articles').doc(choosen_article.doc_id).get()
      ref.then(function(doc) {
        if (doc.exists) {
          console.log(doc.data().title)
          // window.localStorage.setItem("sim_artc", doc.data().title)
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "ARTICLE", similar_article: {
              title: doc.data().title, id: choosen_article.doc_id, curr_id: curr_id, curr_art: curr_article.data, new_article: doc.data()}
            });
          });
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    })
  });
}

async function get_article_id(title, url, entities) {
  var article_id = []
  db.collection("Articles").where("title", "==", title).get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(doc => {
      article_id.push({id: doc.id, data: doc.data()})
    })
    console.log(article_id)
    if (article_id.length > 0) {
      compareDB(url, entities, article_id[0])
    }
    else {
      compareDB(url, entities, "No article found")
    }
  })
}

function update_similarity_score(src, article1, article2) {
  console.log("article 2: "+article2)
  var added_score = 0
  if (src === "YES") {
    added_score = 1
  } else if (src === "NOT RELATED") {
    added_score = -0.5
  }
  var art1_ref = db.collection("Articles").doc(article1)
  art1_ref.get().then(doc => {
    var curr_data = doc.data().scores
    console.log(typeof curr_data)
    if (curr_data === undefined) {
      var new_score = {
        score: added_score,
        num_survey: 1
      }
      var new_data = {}
      new_data[article2] = new_score
      console.log(new_data)
      art1_ref.update({
        "scores": new_data
      })
    }
    else if (article2 in curr_data) {
      console.log("Article found")
      var curr_score = curr_data[article2]
      var new_score = {
        score: (curr_score.score * curr_score.num_survey + added_score)/(curr_score.num_survey+1),
        num_survey: curr_score.num_survey+1
      }
      curr_data[article2] = new_score
      console.log(curr_data)
      art1_ref.update({
        "scores": curr_data
      })
    }
    else {
      var new_score = {
        score: added_score,
        num_survey: 1
      }
      curr_data[article2] = new_score
      art1_ref.update({
        "scores": curr_data
      })
    }
  })
  //Update for the second article
  var art2_ref = db.collection("Articles").doc(article2)
  art2_ref.get().then(doc => {
    var curr_data = doc.data().scores
    console.log(curr_data)
    if (curr_data === undefined) {
      var new_score = {
        score: added_score,
        num_survey: 1
      }
      var new_data = {}
      new_data[article1] = new_score
      art2_ref.update({
        "scores": new_data
      })
    }
    else if (article1 in curr_data) {
      console.log("Article found")
      var curr_score = curr_data[article1]
      var new_score = {
        score: (curr_score.score * curr_score.num_survey + added_score)/(curr_score.num_survey+1),
        num_survey: curr_score.num_survey+1
      }
      curr_data[article1] = new_score
      console.log(curr_data)
      art2_ref.update({
        "scores": curr_data
      })
    }
    else {
      var new_score = {
        score: added_score,
        num_survey: 1
      }
      curr_data[article1] = new_score
      art2_ref.update({
        "scores": curr_data
      })
    }
  })
}