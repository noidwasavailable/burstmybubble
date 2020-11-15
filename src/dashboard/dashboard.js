//router

document.getElementById('menubar-item-home').onclick = (event) => {
  if (!window.location.pathname.includes('home'))
    window.open('./dashboard_home.html', '_self');
};

document.getElementById('menubar-item-history').onclick = () => {
  if (!window.location.pathname.includes('history'))
    window.open('./dashboard_history.html', '_self');
};

document.getElementById('menubar-item-feed').onclick = () => {
  if (!window.location.pathname.includes('feed'))
    window.open('./dashboard_feed.html', '_self');
};

///*dashboard_feed*///
const feedPage = document.getElementById('feedJs');

if (feedPage) {
  const topicList = feedPage.querySelectorAll('.feed__topic');

  topicList.forEach((topic) => {
    const articles = topic.querySelector('.feed__articles');
    const leftBtn = topic.querySelector('.feed__icon-left');
    const rightBtn = topic.querySelector('.feed__icon-right');

    leftBtn.addEventListener('click', function handleLeftBtn() {
      articles.scrollBy({
        left: -990,
        behavior: 'smooth',
      });
    });
    rightBtn.addEventListener('click', function handleRightBtn() {
      articles.scrollBy({
        left: +990,
        behavior: 'smooth',
      });
    });
  });
}
