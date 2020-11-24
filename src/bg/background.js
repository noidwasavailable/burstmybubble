// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

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
                  console.log(res)
                  compareDB(current_tab_info.url, res.entities)
              })
              // console.log('I injected');
            }
          );
        }
      });
    });
  } else if (request.message === 'Open Dashboard') {
    console.log('Dashboard please');
    chrome.tabs.create({ url: 'src/dashboard/dashboard_home.html' });
  }
});

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

function compareDB(url, entities) {
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
      //Set to 0 as a test; Can be changed into the one with saliency
      var ref = firebase.firestore().collection('Articles').doc(similar_articles[0].doc_id).get()
      ref.then(function(doc) {
        if (doc.exists) {
          console.log(doc.data().title)
          window.localStorage.setItem("sim_artc", doc.data().title)
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    })
  });
}
