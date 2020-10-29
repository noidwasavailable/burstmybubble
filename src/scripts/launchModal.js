renderSurveyModal();

function renderSurveyModal() {
  const modal = document.createElement('div');
  modal.classList.add('ext-modal');

  //Construct the modal
  const article_1 =
    "<div class='article'> <img src='https://media.heartlandtv.com/images/Biden+and+Trump+election+.jpg' class='article-img'/><h3 class='article-title'> Debate Night For Trump and Biden In Final Campaign Faceoff </h3> <h4 class='article-tag'> <span> Politics </span> -- <span class='ext-sent-mild'> Mild </span> </h4> </div>";
  const article_2 =
    "<div class='article'> <img src='https://c.o0bc.com/wp-content/uploads/2020/10/Election_2020_Debate_30924-850x478$large.jpg' class='article-img'/><h3 class='article-title'> More than 15,000 readers said this candidate won the final presidential debate and how it affected their vote </h3> <h4 class='article-tag'> <span> Politics </span> -- <span class='ext-sent-spicy'> Spicy </span> </h4> </div>";
  const combine_article =
    "<div style='display: flex; padding: 8px 0px;'>" +
    article_1 +
    article_2 +
    '</div>';
  const question_section =
    "<div style='margin: 0px 2rem;'><h2> Do they share the same opinion? </h2> <button style='background-color: #35CD96;' class='my-button'> Yes </button><button style='background-color: #FF4975' class='my-button'> No </button></div>";
  const complete_modal =
    "<div style='margin: 16px 16px;'><h1 style='margin: 2rem 2rem;'> Here are two articles you've recently read: </h1>" +
    combine_article +
    question_section +
    '</div>';

  const child = document.createElement('div');
  child.classList.add('ext-child');
  child.innerHTML = "<div style='overflow: auto;'>" + complete_modal + '</div>';
  // child.innerHTML = "<h1> Tes </h1>"

  modal.appendChild(child);
  document.querySelector('body').appendChild(modal);
  const parent = document.querySelector('body');
  parent.insertBefore(modal, parent.firstChild);
}
