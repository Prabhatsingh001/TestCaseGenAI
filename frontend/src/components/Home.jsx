import React from "react";
import config from "../config/config"

const GITHUB_CLIENT_ID = config.client_id;
const REDIRECT_URI = "http://localhost:8000/auth/github/callback";

export default function Home() {
  const loginWithGitHub = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo user`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-purple-900 min-h-screen flex flex-col text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-3 bg-transparent backdrop-blur-md shadow-lg">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          TestGenAI
        </h1>
        <button
          onClick={loginWithGitHub}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-md hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
        >
          Login with GitHub
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-24 px-6">
        <h2 className="text-5xl font-extrabold text-white leading-tight">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Test Case Generator</span>
        </h2>
        <p className="text-lg text-gray-300 mt-5 max-w-3xl font-medium">
          Seamlessly connect your GitHub repository, select code files, and let our AI generate precise test cases to enhance your project's quality.
        </p>
        <button
          onClick={loginWithGitHub}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="mt-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {[
          {
            title: "1. Connect GitHub",
            desc: "Securely log in with GitHub and choose a repository to analyze with ease."
          },
          {
            title: "2. Generate Test Cases",
            desc: "Our AI intelligently analyzes your code and crafts detailed test case summaries."
          },
          {
            title: "3. Create Pull Request",
            desc: "Generate test code and seamlessly push changes via a GitHub pull request."
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="relative bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
              Step {idx + 1}
            </div>
            <h3 className="text-xl font-semibold text-white mt-6">
              {feature.title}
            </h3>
            <p className="text-gray-300 mt-3 font-medium">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900/80 p-8 text-center text-gray-400">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} TestGenAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}