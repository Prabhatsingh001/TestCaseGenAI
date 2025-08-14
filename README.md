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

```
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
## or
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

## License
MIT
