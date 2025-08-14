import requests
from fastapi import FastAPI,status,HTTPException,Header
from config import settings
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
import google.generativeai as genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allow Authorization header
)

CLIENT_ID = settings.client_id
CLIENT_SECRET = settings.client_secret
GITHUB_API = settings.github_api
GOOGLE_API_KEY = settings.google_api_key

@app.get("/auth/github/callback")
def github_callback(code: str):
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

# ---------- MODELS ----------
class GenerateTestRequest(BaseModel):
    repo: str
    file_path: str

class CreatePRRequest(BaseModel):
    repo: str
    branch: str
    test_file_path: str
    test_content: str
    commit_message: str = "Add AI-generated test cases"

class GenerateSummaryRequest(BaseModel):
    repo: str
    files: list[str]

# ---------- HELPERS ----------
def get_github_headers(token: str):
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

def get_file_content(token: str, owner: str, repo: str, file_path: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{file_path}"
    print(url)
    res = requests.get(url, headers=get_github_headers(token))
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.json())
    return res.json()

# ---------- ROUTES ----------

@app.get("/repos/{repo}/files")
def list_repo_files(repo: str, authorization: str = Header(...)):
    """List all code files in the repo"""
    token = authorization.replace("Bearer ", "")
    user_res = requests.get(f"{GITHUB_API}/user", headers=get_github_headers(token))
    if user_res.status_code != 200:
        raise HTTPException(status_code=user_res.status_code, detail=user_res.json())
    owner = user_res.json()["login"]
    branch = "main"
    tree_res = requests.get(
        f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
        headers=get_github_headers(token)
    )
    if tree_res.status_code != 200:
        raise HTTPException(status_code=tree_res.status_code, detail=tree_res.json())
    tree = tree_res.json()["tree"]
    code_extensions = (
        ".py", ".js", ".ts", ".tsx", ".java", ".cpp", ".c", ".cs", ".go", ".rb", 
        ".php", ".html", ".css", ".scss", ".less", ".swift", ".kt", ".rs", ".sh", 
        ".sql", ".r", ".m", ".hs", ".scala", ".pl", ".lua", ".dart"
    )
    code_files = [f["path"] for f in tree if f["type"] == "blob" and f["path"].endswith(code_extensions)]
    return code_files

@app.post("/genai/generate-summary")
def generate_summary(req: GenerateSummaryRequest, authorization: str = Header(...)):
    """Generate test case summaries for multiple files using Gemini AI"""
    token = authorization.replace("Bearer ", "")
    user_res = requests.get(f"{GITHUB_API}/user", headers=get_github_headers(token))
    if user_res.status_code != 200:
        raise HTTPException(status_code=user_res.status_code, detail=user_res.json())
    owner = user_res.json()["login"]
    genai.configure(api_key=GOOGLE_API_KEY)  # type: ignore
    model = genai.GenerativeModel("gemini-2.5-flash")  # type: ignore

    summaries = []
    MAX_CODE_LINES = 200

    for file_path in req.files:
        try:
            file_data = get_file_content(token, owner, req.repo, file_path)
            decoded_content = base64.b64decode(file_data["content"]).decode("utf-8")

            print(decoded_content)

            code_lines = decoded_content.splitlines()
            if len(code_lines) > MAX_CODE_LINES:
                decoded_content = "\n".join(code_lines[:MAX_CODE_LINES])
                decoded_content += "\n\n# Code truncated for summary generation..."
            prompt = (
                "Summarize in bullet points the key unit tests needed for the following code. "
                "Be concise. Output should not exceed 10 bullet points.\n\n"
                f"{decoded_content}"
            )

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 4096
                }
            )

            print(response)

            summary_text = "No summary generated"
            if hasattr(response, "text") and response.text:
                summary_text = response.text.strip()
            elif hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]
                contents = getattr(candidate, "content", None)
                if not isinstance(contents, list):
                    contents = [contents] if contents else []
                text_parts = [part.text for part in contents if hasattr(part, "text")]
                if text_parts:
                    summary_text = "\n".join(text_parts).strip()

            summaries.append({"file": file_path, "summary": summary_text})

        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            summaries.append({"file": file_path, "summary": f"Error generating summary: {str(e)}"})

    return {"summaries": summaries}


@app.post("/genai/generate-tests")
def generate_tests(req: GenerateTestRequest, authorization: str = Header(...)):
    """Fetch file content from GitHub, detect language, and send to Gemini for unit test generation."""
    token = authorization.replace("Bearer ", "")

    # Get user from GitHub
    user_res = requests.get(f"{GITHUB_API}/user", headers=get_github_headers(token))
    if user_res.status_code != 200:
        raise HTTPException(status_code=user_res.status_code, detail=user_res.json())
    owner = user_res.json()["login"]

    # Get file content from GitHub
    file_data = get_file_content(token, owner, req.repo, req.file_path)
    decoded_content = base64.b64decode(file_data["content"]).decode("utf-8")

    # --- Detect language ---
    file_ext = req.file_path.split(".")[-1].lower()
    language_map = {
        "py": "Python (use pytest)",
        "js": "JavaScript (use Jest)",
        "ts": "TypeScript (use Jest with ts-jest)",
        "java": "Java (use JUnit 5)",
        "cpp": "C++ (use GoogleTest)",
        "c": "C (use Unity test framework)",
        "go": "Go (use Go's testing package)",
        "rb": "Ruby (use RSpec)",
        "php": "PHP (use PHPUnit)",
        "cs": "C# (use xUnit)"
    }
    language = language_map.get(file_ext, "the appropriate language and test framework")

    # --- Call Gemini ---
    genai.configure(api_key=GOOGLE_API_KEY)  # type: ignore
    model = genai.GenerativeModel("gemini-2.5-flash")  # type: ignore

    prompt = f"""
        You are an expert {language} developer.
        Generate ONLY high-quality, production-ready **unit test code** for the following {language} code.
        - No explanations.
        - No comments about the project.
        - Include necessary imports.
        - Ensure tests are runnable without modification.
        - also detect the framework and generate test accordingly
        - Follow best practices for {language}.
        Code to test:
        {decoded_content}
    """
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 4096
        }
    )
    generated_tests = getattr(response, "text", "").strip()
    if not generated_tests:
        raise HTTPException(status_code=500, detail="No test cases generated.")

    return {
        "language": language,
        "generated_tests": generated_tests
    }


@app.post("/repos/create-pr")
def create_pr(req: CreatePRRequest, authorization: str = Header(...)):
    """Create a new branch, commit test file, and open PR"""
    token = authorization.replace("Bearer ", "")
    user_res = requests.get(f"{GITHUB_API}/user", headers=get_github_headers(token))
    if user_res.status_code != 200:
        raise HTTPException(status_code=user_res.status_code, detail=user_res.json())
    owner = user_res.json()["login"]
    branch_res = requests.get(
        f"{GITHUB_API}/repos/{owner}/{req.repo}/git/ref/heads/main",
        headers=get_github_headers(token)
    )
    if branch_res.status_code != 200:
        raise HTTPException(status_code=branch_res.status_code, detail=branch_res.json())
    main_sha = branch_res.json()["object"]["sha"]
    branch_name = req.branch
    create_branch_res = requests.post(
        f"{GITHUB_API}/repos/{owner}/{req.repo}/git/refs",
        headers=get_github_headers(token),
        json={"ref": f"refs/heads/{branch_name}", "sha": main_sha}
    )
    if create_branch_res.status_code not in (200, 201):
        raise HTTPException(status_code=create_branch_res.status_code, detail=create_branch_res.json())

    import base64
    encoded_content = base64.b64encode(req.test_content.encode("utf-8")).decode("utf-8")
    commit_res = requests.put(
        f"{GITHUB_API}/repos/{owner}/{req.repo}/contents/{req.test_file_path}",
        headers=get_github_headers(token),
        json={
            "message": req.commit_message,
            "content": encoded_content,
            "branch": branch_name
        }
    )
    if commit_res.status_code not in (200, 201):
        raise HTTPException(status_code=commit_res.status_code, detail=commit_res.json())
    pr_res = requests.post(
        f"{GITHUB_API}/repos/{owner}/{req.repo}/pulls",
        headers=get_github_headers(token),
        json={
            "title": req.commit_message,
            "head": branch_name,
            "base": "main",
            "body": "This PR adds AI-generated test cases."
        }
    )
    if pr_res.status_code not in (200, 201):
        raise HTTPException(status_code=pr_res.status_code, detail=pr_res.json())

    return pr_res.json()