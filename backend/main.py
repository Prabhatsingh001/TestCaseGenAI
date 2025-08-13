import requests
from fastapi import FastAPI,status
from config import settings
from fastapi.responses import RedirectResponse

app = FastAPI()

CLIENT_ID = settings.client_id
CLIENT_SECRET = settings.client_secret

@app.get("/auth/github/callback")
def github_callback(code: str):
    # Exchange code for access token
    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code
        }
    )
    token_json = token_response.json()
    access_token = token_json.get("access_token")
    return RedirectResponse(url=f"http://localhost:5173/dashboard?token={access_token}",status_code=status.HTTP_302_FOUND)