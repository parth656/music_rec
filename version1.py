from flask import Flask, render_template, session, url_for, g, request, redirect
from flask_session import Session
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
import requests
from urllib.parse import quote

app = Flask(__name__)
app.secret_key = "454Group11SecretKey"

# Spotify authentication steps, paramaters, responses @ https://developer.spotify.com/web-api/authorization-guide/
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

auth_query_parameters = {
    "response_type": "code",
    "redirect_uri": REDIRECT_URI,
    "scope": SCOPE,
    # "state": STATE,
    # "show_dialog": SHOW_DIALOG_str,
    "client_id": CLIENT_ID
}

# Class to store the user's session data
class CurrentUser:
    def __init__(self, session):
        self.display_name = session["display_name"]
        self.user_uri = session["user_uri"]
        self.external_url = session["external_urls"]["spotify"]

@app.route("/")
def index():
    # Auth Step 1: Authorization
    url_args = "&".join(["{}={}".format(key, quote(val)) for key, val in auth_query_parameters.items()])
    auth_url = "{}/?{}".format(SPOTIFY_AUTH_URL, url_args)
    return redirect(auth_url)

@app.route("/callback/q")
def callback():
    # Auth Step 4: Requests refresh and access tokens
    auth_token = request.args['code']
    code_payload = {
        "grant_type": "authorization_code",
        "code": str(auth_token),
        "redirect_uri": REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }
    post_request = requests.post(SPOTIFY_TOKEN_URL, data=code_payload)

    # Auth Step 5: Tokens are Returned to Application
    response_data = json.loads(post_request.text)
    access_token = response_data["access_token"]
    refresh_token = response_data["refresh_token"]
    token_type = response_data["token_type"]
    expires_in = response_data["expires_in"]

    # Auth Step 6: Use the access token to access Spotify API
    authorization_header = {"Authorization": "Bearer {}".format(access_token)}

    # Get profile data
    user_profile_api_endpoint = "{}/me".format(SPOTIFY_API_URL)
    profile_response = requests.get(user_profile_api_endpoint, headers=authorization_header)
    profile_data = json.loads(profile_response.text)

    # Save the session data for future use
    session['display_name'] = profile_data["display_name"]
    session['user_uri'] = profile_data["uri"]
    session['external_urls'] = profile_data["external_urls"]

    # Get user playlist data
    playlist_api_endpoint = "{}/playlists".format(profile_data["href"])
    playlists_response = requests.get(playlist_api_endpoint, headers=authorization_header)
    playlist_data = json.loads(playlists_response.text)

    # Get names of playlists
    playlist_names = [sp.playlist(x["uri"])["name"] for x in playlist_data["items"]]
    session['playlists'] = playlist_names

    return redirect(url_for('homescreen'))

@app.route("/homescreen")
def homescreen():
    user = CurrentUser(session)
    message = "Current user display name: " + user.display_name
    return render_template("homescreen.html", txt=message)

@app.route("/playlists")
def playlists():
    user = CurrentUser(session)
    message = "Current user URI: " + user.user_uri
    return render_template("playlists.html", sorted_array=session['playlists'], txt=message)

@app.route("/history")
def history():
    user = CurrentUser(session)
    message = "Current user external URL: " + user.external_url
    return render_template("history.html", txt=message)

@app.route("/login")
def login():
    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True, port=PORT)

