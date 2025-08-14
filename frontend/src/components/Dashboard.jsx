import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("github_token");

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("github_token");
    navigate("/");
  };

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [testSummaries, setTestSummaries] = useState([]);
  const [generatedTests, setGeneratedTests] = useState({});

  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/");

    const fetchRepos = async () => {
      try {
        setLoadingRepos(true);
        const res = await fetch("https://api.github.com/user/repos", {
          headers: { Authorization: `token ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch repositories");
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        // alert("Error fetching repositories. Please try again.");
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, [token, navigate]);

  // Fetch repo files
  const fetchRepoFiles = async () => {
    if (!selectedRepo) return alert("Please select a repository first");

    try {
      setLoadingFiles(true);
      const res = await fetch(
        `http://localhost:8000/repos/${encodeURIComponent(selectedRepo)}/files`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
      setSelectedFiles([]);
      setTestSummaries([]);
      setGeneratedTests({});
    } catch (err) {
      console.error(err);
      alert("Error fetching files. Please try again.");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Generate test summary for multiple files
  const generateTestSummary = async () => {
    if (selectedFiles.length === 0) return alert("Please select at least one file");

    try {
      setLoadingSummary(true);
      const res = await fetch(`http://localhost:8000/genai/generate-summary`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo: selectedRepo, files: selectedFiles }),
      });
      if (!res.ok) throw new Error("Failed to generate test summaries");
      const data = await res.json();
      setTestSummaries(data.summaries || []);
      // alert(`Summaries generated for ${selectedFiles.length} file(s)`);
    } catch (err) {
      console.error(err);
      // alert("Error generating test summaries. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Generate tests for a specific file
  const generateTestsForFile = async (file) => {
    try {
      setLoadingTests(true);
      const res = await fetch(`http://localhost:8000/genai/generate-tests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo: selectedRepo, file_path: file }),
      });
      if (!res.ok) throw new Error(`Failed to generate tests for ${file}`);
      const data = await res.json();
      setGeneratedTests((prev) => ({ ...prev, [file]: data.generated_tests || "" }));
      // alert(`Tests generated successfully for ${file}`);
    } catch (err) {
      console.error(err);
      // alert(`Error generating tests for ${file}. Please try again."`);
    } finally {
      setLoadingTests(false);
    }
  };

  const resetSelections = () => {
    setSelectedFiles([]);
    setTestSummaries([]);
    setGeneratedTests({});
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file)
        ? prev.filter((f) => f !== file)
        : [...prev, file]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 p-8 text-white">
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          AI Test Case Generator
        </h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300"
        >
          Logout
        </button>
      </div>
      <div className="mb-12 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-7xl mx-auto transition-all duration-300 hover:shadow-xl">
        <label className="block text-base font-medium text-gray-200 mb-2">
          Select Repository
        </label>
        <div className="flex items-center gap-4">
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            disabled={loadingRepos}
            className="flex-1 bg-gray-700/80 border border-gray-600/50 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
          >
            <option value="" className="bg-gray-800">
              {loadingRepos ? "Loading..." : "-- Choose Repository --"}
            </option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.name} className="bg-gray-800">
                {repo.name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchRepoFiles}
            disabled={loadingFiles || !selectedRepo}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
          >
            {loadingFiles ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
                Fetching...
              </span>
            ) : (
              "Fetch Files"
            )}
          </button>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mb-12 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-7xl mx-auto transition-all duration-300 hover:shadow-xl">
          <label className="block text-base font-medium text-gray-200 mb-2">
            Select Files ({selectedFiles.length} selected)
          </label>
          <div className="max-h-64 overflow-y-auto bg-gray-700/80 rounded-lg border border-gray-600/50">
            {files.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center p-3 border-b border-gray-600/50 last:border-b-0 cursor-pointer transition-all duration-200 ${
                  selectedFiles.includes(file)
                    ? "bg-cyan-600/20 text-cyan-100"
                    : "hover:bg-gray-600/50"
                }`}
                onClick={() => toggleFileSelection(file)}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file)}
                  onChange={() => toggleFileSelection(file)}
                  className="mr-3 h-5 w-5 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded"
                />
                <span className="text-gray-100">{file}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={generateTestSummary}
              disabled={loadingSummary || selectedFiles.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50"
            >
              {loadingSummary ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Summary"
              )}
            </button>
            <button
              onClick={resetSelections}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {testSummaries.length > 0 && (
        <div className="mb-12 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-7xl mx-auto transition-all duration-300 hover:shadow-xl">
          <h2 className="text-lg font-medium text-gray-200 mb-3">
            Test Case Summaries
          </h2>

          {testSummaries.map((item) => {
            const points = item.summary
              ? item.summary
                  .split(/\n|•|-/)
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0)
              : ["No summary generated"];

            return (
              <div
                key={item.file}
                className="mb-6 p-5 bg-gray-700/80 rounded-lg border border-gray-600/50"
              >
                <p className="mb-4 font-semibold text-cyan-300">{item.file}</p>
                <ul className="space-y-2 text-sm text-gray-300 list-none">
                  {points.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 hover:text-cyan-200 transition-colors"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400 flex-shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button
                    onClick={() => generateTestsForFile(item.file)}
                    disabled={loadingTests || generatedTests[item.file]}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {loadingTests && !generatedTests[item.file] ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                          />
                        </svg>
                        Generating Tests...
                      </span>
                    ) : generatedTests[item.file] ? (
                      "Tests Generated"
                    ) : (
                      "Generate Tests"
                    )}
                  </button>
                </div>
                {Object.keys(generatedTests).length > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full mx-4 p-6 border border-cyan-500/30">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cyan-300">Generated Unit Tests</h2>
                        <button
                          onClick={() => setGeneratedTests({})}
                          className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      </div>
                      <div className="max-h-[70vh] overflow-y-auto rounded-lg bg-gray-800 border border-gray-700 p-4">
                        {Object.entries(generatedTests).map(([file, tests]) => (
                          <div key={file} className="mb-6">
                            <p className="text-lg font-semibold text-cyan-400 mb-3">{file}</p>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                              <code>{tests}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
