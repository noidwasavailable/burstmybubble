renderSurveyModal();

function renderSurveyModal() {
    //TODO: NEED TO ALSO STORE DOC ID OF CURRENT ARTICLE
    function handle_survey(source, id1, id2) {
        chrome.runtime.sendMessage({message: 'Update Similarity Score', article1: id1, article2: id2, src: source})
        //Display thank you for answering the question
        alert("Thank you for answering the survey")
        document.querySelector('body').removeChild(modal)
    }

    const modal = document.createElement('div')
    modal.id = "burstbubble-modal"
    modal.classList.add('ext-modal')
  
    //Construct the modal
    const x_mark_svg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' id='close-modal-btn'> <path d='M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.538l-4.592-4.548 4.546-4.587-1.416-1.403-4.545 4.589-4.588-4.543-1.405 1.405 4.593 4.552-4.547 4.592 1.405 1.405 4.555-4.596 4.591 4.55 1.403-1.416z'/></svg>"

    const article_1 = "<div class='article'> <img src='https://media.heartlandtv.com/images/Biden+and+Trump+election+.jpg' class='article-img'/><h3 class='article-title' id='first-article-title'> Debate Night For Trump and Biden In Final Campaign Faceoff </h3> <h4 class='article-tag'> <span id='article1-category'> Politics </span> -- <span class='ext-sent-mild' id='article1-sentiment'> Mild </span> </h4> </div>"

    const article_2 = "<div class='article'> <img src='https://c.o0bc.com/wp-content/uploads/2020/10/Election_2020_Debate_30924-850x478$large.jpg' class='article-img'/><h3 class='article-title' id='second-article-title'> More than 15,000 readers said this candidate won the final presidential debate and how it affected their vote </h3> <h4 class='article-tag'> <span id='article2-category'> Politics </span> -- <span class='ext-sent-spicy' id='article2-sentiment'> Spicy </span> </h4> </div>"

    const finding_article_2  = "<div class='article-searching' style='text-align: center; margin-top: 1rem; margin-bottom: 3rem'><h2> Finding an article...</h2> <div class='ext-loader'></div></div>"
    const finished_loading = article_1 + article_2
    const combine_article = "<div style='display: flex; padding: 8px 0px;' id='ext-combined-article'>" +finding_article_2+ "<div id='second-article'></div>"+"</div>"
    const question_section = "<div style='margin: 1rem 2rem; display: none' id='ext-question-sect'><h2> Do they share the same opinion? </h2> <button style='background-color: #35CD96; border: 2px solid #35CD96' class='my-button' id='yes-similar-button'> Yes </button><button style='background-color: #FF4975; border: 2px solid #FF4975' class='my-button' id='no-similar-button'> No </button> <button style='color: grey; background-color: white; border: 2px solid grey;' class='my-button' id='not-related-button'> Not Related </button></div> </div>"
    const top_bar = " <h1 style='margin: 1rem 2rem;'> Here are two articles you've recently read: </h1>"
    const complete_modal = "<div style='margin: 16px 16px;'>"+ top_bar + combine_article + question_section + "</div>"

    const child = document.createElement('div')
    child.classList.add('ext-child')
    child.innerHTML = "<div style='overflow: auto;'>"+ x_mark_svg + complete_modal + "</div>"
    // child.innerHTML = "<h1> Tes </h1>"

    modal.appendChild(child)
    document.querySelector('body').appendChild(modal)
    const parent = document.querySelector('body')
    parent.insertBefore(modal, parent.firstChild)


    document.getElementById('close-modal-btn').onclick = function(){
        document.querySelector('body').removeChild(modal)
    }

    
    chrome.runtime.onMessage.addListener(function(message) {
        // console.log(message)
        if (message.type === "ARTICLE") {
            console.log(message)
            localStorage.setItem("sim_artc", JSON.stringify(message.similar_article))
            // console.log(JSON.parse(localStorage.getItem("sim_artc")))
            document.getElementById('ext-question-sect').style.display = "block"
            document.getElementById("ext-combined-article").innerHTML = finished_loading
            document.getElementById("first-article-title").innerHTML = message.similar_article.curr_art.title
            document.getElementById("second-article-title").innerHTML = message.similar_article.title

            document.getElementById("article1-category").innerHTML = message.similar_article.curr_art.category.name
            document.getElementById("article2-category").innerHTML = message.similar_article.new_article.category.name

            const article1_sentiment = classify_sentiment(message.similar_article.curr_art.sentiment)
            const article2_sentiment = classify_sentiment(message.similar_article.new_article.sentiment)

            document.getElementById("article1-sentiment").innerHTML = article1_sentiment.sentiment
            document.getElementById("article1-sentiment").classList.add(article1_sentiment.css_class)
            document.getElementById("article2-sentiment").innerHTML = article2_sentiment.sentiment
            document.getElementById("article2-sentiment").classList.add(article2_sentiment.css_class)

            document.getElementById('yes-similar-button').onclick = function() {
                handle_survey("YES", message.similar_article.id, message.similar_article.curr_id)
            }
            document.getElementById('no-similar-button').onclick = function() {
                handle_survey("NO", message.similar_article.id, message.similar_article.curr_id)
            }
            document.getElementById('not-related-button').onclick = function() {
                handle_survey("NOT RELATED", message.similar_article.id, message.similar_article.curr_id)
            }
        }
        return true
    })
}

function classify_sentiment(sent_score) {
    const magnitude = sent_score.magnitude
    const score = sent_score.score
    if (magnitude > 40) {
        return {sentiment: "Spicy", css_class: "ext-sent-spicy"}
    }
    else if (magnitude > 25) {
        return {sentiment: "Hot", css_class: "ext-sent-hot"}
    }
    else if (magnitude > 15) {
        return {sentiment: "Mild", css_class: "ext-sent-mild"}
    }
    else if (magnitude > 5) {
        return {sentiment: "Soft", css_class: "ext-sent-soft"}
    }
    else  {
        return {sentiment: "Bland", css_class: "ext-sent-bland"}
    }
}


/*The procedure of comparison back-end
Scenario 1: The database already exist, so need to compare current article with a random but similar in entity with the current article
1. Read the url and get the title of current article
2. Analyze the entity based on the title (or the content, if you can)
3. Find a similar one in the database
4. Bring it out for comparison
5. Compare and store the result

*/
