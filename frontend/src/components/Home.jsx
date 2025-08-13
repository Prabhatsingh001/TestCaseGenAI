// src/App.jsx
import React from "react";
import config from "../config/config"

const GITHUB_CLIENT_ID = config.client_id;
const REDIRECT_URI = "http://localhost:8000/auth/github/callback";

export default function Home() {
  const loginWithGitHub = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo user`;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-indigo-600">TestGenAI</h1>
        <button
          onClick={loginWithGitHub}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Login with GitHub
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-20 px-6">
        <h2 className="text-4xl font-bold text-gray-800">
          AI-Powered Test Case Generator
        </h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl">
          Connect your GitHub repository, select code files, and let AI generate
          detailed test cases for your project. Save time and boost code
          quality.
        </p>
        <button
          onClick={loginWithGitHub}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="mt-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            title: "1. Connect GitHub",
            desc: "Log in with GitHub and select a repository to analyze."
          },
          {
            title: "2. Generate Test Cases",
            desc: "AI analyzes your selected files and suggests test case summaries."
          },
          {
            title: "3. Create Pull Request",
            desc: "Generate test code and optionally push changes via a GitHub PR."
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold text-indigo-600">
              {feature.title}
            </h3>
            <p className="text-gray-600 mt-2">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-100 p-6 text-center text-gray-500">
        © {new Date().getFullYear()} TestGenAI. All rights reserved.
      </footer>
    </div>
  );
}