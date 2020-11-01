renderSurveyModal();

function renderSurveyModal() {
    const modal = document.createElement('div')
    modal.id = "burstbubble-modal"
    modal.classList.add('ext-modal')
  
    //Construct the modal
    const x_mark_svg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' id='close-modal-btn'> <path d='M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.538l-4.592-4.548 4.546-4.587-1.416-1.403-4.545 4.589-4.588-4.543-1.405 1.405 4.593 4.552-4.547 4.592 1.405 1.405 4.555-4.596 4.591 4.55 1.403-1.416z'/></svg>"

    const article_1 = "<div class='article'> <img src='https://media.heartlandtv.com/images/Biden+and+Trump+election+.jpg' class='article-img'/><h3 class='article-title'> Debate Night For Trump and Biden In Final Campaign Faceoff </h3> <h4 class='article-tag'> <span> Politics </span> -- <span class='ext-sent-mild'> Mild </span> </h4> </div>"
    const article_2 = "<div class='article'> <img src='https://c.o0bc.com/wp-content/uploads/2020/10/Election_2020_Debate_30924-850x478$large.jpg' class='article-img'/><h3 class='article-title'> More than 15,000 readers said this candidate won the final presidential debate and how it affected their vote </h3> <h4 class='article-tag'> <span> Politics </span> -- <span class='ext-sent-spicy'> Spicy </span> </h4> </div>"
    const combine_article = "<div style='display: flex; padding: 8px 0px;'>" + article_1+article_2+"</div>"
    const question_section = "<div style='margin: 1rem 2rem;'><h2> Do they share the same opinion? </h2> <button style='background-color: #35CD96;' class='my-button'> Yes </button><button style='background-color: #FF4975' class='my-button'> No </button></div>"
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
}
