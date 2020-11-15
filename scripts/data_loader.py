import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import requests
from bs4 import BeautifulSoup
project_id = "burst-my-bubble"


''' 
Notes:
    1. You should always run this script in the scripts directory.
    2. The functions here are for both collecting articles from the internet and also uploading them to database.
    ...
'''

# Use the application default credentials
cred = credentials.Certificate("../deps/burst-my-bubble-firebase-adminsdk-dwfzd-b0383cae47.json")
firebase_admin.initialize_app(cred, {
  'projectId': project_id
,
})

db = firestore.client()

# Load an article to the data base by using its title, author and content fields.
def load_data(title, author, content):
    doc_ref = db.collection(u'Articles').document()
    doc_ref.set({
        u'title': title,
        u'author': author,
        u'content': content,
    })

# Function to load any url data.
# Usage not clearly identified yet.
def load_url(url):
    res = requests.get(url)
    html_page = res.content
    soup = BeautifulSoup(html_page, 'html.parser')
    text = soup.find_all(text=True)
    print (text)

# Fetch a guardian article using just the url and view.
# This function does not upload the article to the database yet.
def fetch_guardian_article(url, api_url = False):
    if not api_url:
        api_initial = r'https://content.guardianapis.com'
        # https://www.theguardian.com/world/2020/nov/04/exit-polls-economy-covid-lockdown-trump
        article_name_index = url.index("theguardian.com") + 15
        url = api_initial + url[article_name_index:]
    print(url)
    my_key = r'6931ad10-849a-4813-b9e9-cc282745b911'
    payload = {
        'api-key':              my_key,
        'page-size':            10,
        'show-editors-picks':   'true',
        'show-fields':          'all'

    }
    r = requests.get(url, params=payload)
    r = r.json()
    print (r)

