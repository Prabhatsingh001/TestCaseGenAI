# TestCaseGenAI

TestCaseGenAI is a full-fledged web application that helps you generate AI-powered test cases, browse your GitHub repositories, and create pull requests—all in one place.

## Features

- **GitHub OAuth Login**: Securely log in with your GitHub account.
- **Repository Browser**: View and select your repositories.
- **File Selection**: Choose files from your repo for test generation.
- **AI Test Case Generation**: Generate test case summaries and code using AI.
- **Pull Request Creation**: Seamlessly create PRs with generated tests.
- **Logout**: Securely log out and clear your session.

## Project Structure

```text
TestCaseGenerator/
├── backend/
│   ├── __init__.py
│   ├── config.py
│   └── main.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Dashboard.jsx
│   │       ├── Home.jsx
│   │       └── ProtectedRoute.jsx
│   │   └── config/
│   │       └── config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.10+

### Backend Setup

1. Navigate to the `backend` folder:

```sh
cd backend
```

2. Install dependencies (if any, e.g. FastAPI, Uvicorn):

```sh
pip install fastapi uvicorn
```

### or

```bash
pip install -r requirements.txt
```

3. Start the backend server:

```sh
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the `frontend` folder:

```sh
cd frontend
```

2. Install dependencies:

```sh
npm install
```

3. Start the frontend dev server:

```sh
npm run dev
```

### Usage

1. Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).
2. Log in with GitHub.
3. Select a repository and files, generate test cases, and create PRs.

## Technologies Used

- React (Vite)
- FastAPI (Python)
- GitHub OAuth
- Tailwind CSS (for UI)

## API Endpoints

All endpoints are served from the backend FastAPI server (default: `http://localhost:8000`).

### `GET /auth/github/callback`

**Description:** GitHub OAuth callback. Exchanges code for access token and redirects to the frontend dashboard with the token in the URL.

- **Query Parameters:**
- `code` (string, required): GitHub OAuth code
- **Returns:** Redirects to `/dashboard?token=...` on the frontend.

### `GET /repos/{repo}/files`

**Description:** List all code files in the specified repository.

- **Path Parameters:**
- `repo` (string, required): Repository name
- **Headers:**
- `Authorization: Bearer <token>`
- **Returns:** `200 OK` with a JSON array of file paths

### `POST /genai/generate-summary`

**Description:** Generate test case summaries for multiple files using Gemini AI.

- **Headers:**
- `Authorization: Bearer <token>`
- **Body:**

```json
{
    "repo": "<repo_name>",
    "files": ["file1.py", "file2.js", ...]
}
```

- **Returns:** `200 OK` with summaries for each file

### `POST /genai/generate-tests`

**Description:** Generate unit test code for a specific file using Gemini AI.

- **Headers:**
- `Authorization: Bearer <token>`
- **Body:**

```json
{
    "repo": "<repo_name>",
    "file_path": "<file_path>"
}
```

- **Returns:** `200 OK` with generated test code and detected language/framework

### `POST /repos/create-pr` (yet to be implemented fully)

**Description:** Create a new branch, commit a test file, and open a pull request on GitHub.

- **Headers:**
- `Authorization: Bearer <token>`
- **Body:**

```json
{
    "repo": "<repo_name>",
    "branch": "<new_branch_name>",
    "test_file_path": "<path/to/test_file>",
    "test_content": "<test file content>",
    "commit_message": "<commit message>" // optional
}
```

- **Returns:** `200 OK` with the created PR details

## License

MIT
