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
