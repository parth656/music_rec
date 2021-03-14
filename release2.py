from flask import Flask, render_template, session, url_for, g, request, redirect
from flask_session import Session
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
import requests
from urllib.parse import quote

app = Flask(__name__)
app.secret_key = "454Group11SecretKey"

#  Client Keys
CLIENT_ID = "a5618cb6512944f884284860712a9b26"
CLIENT_SECRET = "214fd159d780433bbc94d948703f6bd4"
client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID,client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Spotify URLS
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com"
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)

# Server-side Parameters
CLIENT_SIDE_URL = "http://127.0.0.1"
PORT = 8080
REDIRECT_URI = "{}:{}/callback/q".format(CLIENT_SIDE_URL, PORT)
SCOPE = "user-read-recently-played playlist-modify-public playlist-modify-private"
STATE = ""
SHOW_DIALOG_bool = True
SHOW_DIALOG_str = str(SHOW_DIALOG_bool).lower()

# Limit number of songs returned on a recommendation (< 100)
LIMIT = str(5)

# Class to store the user's session data
class CurrentUser:
    def __init__(self, session):
        self.auth_header = session["auth_header"]
        self.display_name = session["display_name"]
        self.user_uri = session["user_uri"]
        self.external_url = session["external_urls"]["spotify"]
        self.playlists = session["playlists"]
        self.history = session["history"]

# Builds string of seed tracks based on listening history
def seed_tracks(seed):
    temp = ""
    for key in seed:
        temp+=str(seed[key]+"&")
        return str(temp[0:-1])
        
@app.route("/")
def login():
    return render_template("login.html")

@app.route("/authenticate")
def authenticate():
    params = {'response_type': 'code',
              'redirect_uri': REDIRECT_URI,
              'scope': SCOPE,
              #'state': STATE,
              'client_id': CLIENT_ID}

    query_params = "&".join(["{}={}".format(key, quote(val)) for key, val in params.items()])
    response = "{}/?{}".format(SPOTIFY_AUTH_URL, query_params)
    return redirect(response)

@app.route("/callback/q")
def callback():
    # Requests refresh and access tokens
    authorization = request.args['code']
    data = {'grant_type': 'authorization_code',
         'code': str(authorization),
         'redirect_uri': REDIRECT_URI,
         'client_id': CLIENT_ID,
         'client_secret': CLIENT_SECRET}
    post_request = requests.post(SPOTIFY_TOKEN_URL,data=data)

    # Tokens are Returned to Application
    response_data = json.loads(post_request.text)
    access_token = response_data["access_token"]
    refresh_token = response_data["refresh_token"]
    token_type = response_data["token_type"]
    expires_in = response_data["expires_in"]

    # Use the access token to access Spotify API
    auth_header = {"Authorization": "Bearer {}".format(access_token)}
    session["auth_header"] = auth_header

    # Get profile data
    user_profile_api_endpoint = "{}/me".format(SPOTIFY_API_URL)
    profile_response = requests.get(user_profile_api_endpoint, headers=auth_header)
    profile_data = json.loads(profile_response.text)

    # Save the session data for future use
    session['display_name'] = profile_data["display_name"]
    session['user_uri'] = profile_data["uri"]
    session['external_urls'] = profile_data["external_urls"]

    # Get user playlist data
    playlist_api_endpoint = "https://api.spotify.com/v1/me/playlists?limit=50"
    playlists_response = requests.get(playlist_api_endpoint, headers=auth_header)
    playlist_data = json.loads(playlists_response.text)
    playlists = [item for item in playlist_data["items"]]
    session['playlists'] = {playlist["name"]:playlist["uri"][17:] for playlist in playlists}

    # Get user listening history
    history_api_endpoint = "https://api.spotify.com/v1/me/player/recently-played?limit=50"
    history_response = requests.get(history_api_endpoint, headers=auth_header)
    history_data = json.loads(history_response.text)
    tracks = [item["track"] for item in history_data["items"]]
    session["history"] = {track["name"]:track["id"] for track in tracks}
        
    return redirect(url_for('feed'))

@app.route("/feed")
def feed():
    user = CurrentUser(session)
    message = "Welcome, " + user.display_name + "!"
    
    # Gets recommendation based on user listening history
    history_rec_api_endpoint = "https://api.spotify.com/v1/recommendations?limit="+LIMIT+"&seed_tracks="+seed_tracks(user.history)
    history_rec_response = requests.get(history_rec_api_endpoint, headers=user.auth_header)
    history_rec_data = json.loads(history_rec_response.text)
    session["history_rec"] = {track["name"]:(track["id"],track["artists"][0]["name"]) for track in history_rec_data["tracks"]}

    # Gets recommendation based on each user playlist
    broken_playlists = []
    recommendations = []
    for key in user.playlists.keys():
        plst_api_endpoint = "https://api.spotify.com/v1/playlists/"+str(user.playlists[key])+"/tracks?limit=100"
        plst_response = requests.get(plst_api_endpoint, headers=user.auth_header)
        plst_data = json.loads(plst_response.text)
        plst = {item["track"]["name"]:item["track"]["id"] for item in plst_data["items"]}
        try:
            plst_rec_api_endpoint = "https://api.spotify.com/v1/recommendations?limit="+LIMIT+"&seed_tracks="+seed_tracks(plst)
            plst_rec_response = requests.get(plst_rec_api_endpoint, headers=user.auth_header)
            plst_rec_data = json.loads(plst_rec_response.text)
            plst_rec = {track["name"]:(track["id"],track["artists"][0]["name"]) for track in plst_rec_data["tracks"]}
            recommendations.append(plst_rec)
        except:
            broken_playlists.append(key)
            continue

    # Formats data to display on Feed page
    display_data = {"Listening History": session["history_rec"]}
    i = 0
    for playlist in user.playlists:
        if playlist not in broken_playlists:
            display_data.update({playlist: recommendations[i]})
            i+=1

    return render_template("feed.html", sorted_array=display_data, txt=message)

@app.route("/discover")
def discover():
    user = CurrentUser(session)
    message = "Welcome, " + user.display_name + "!"
    placeholder = ["NEED", "TO", "IMPLEMENT", "SEARCH", "AND", "FILTERS"]
    return render_template("discover.html", sorted_array=placeholder, txt=message)

if __name__ == "__main__":
    app.run(debug=True, port=PORT)
