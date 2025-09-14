// src/components/SecurityChatView.jsx (Updated to Report & Analysis Tool)

import React, { useState, useEffect } from "react";
import { api } from "../api";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Spinner from "./ui/Spinner";
import { ShieldAlert, Wand2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SecurityChatView = () => {
  // State for the initial summary report and the generated detailed report
  const [summaryReport, setSummaryReport] = useState(null);
  const [detailedReport, setDetailedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to load the initial summary report
  useEffect(() => {
    const repoPath = localStorage.getItem("repoPath");
    if (!repoPath) {
      setError(
        "Please generate a DevOps report first to view security issues."
      );
      return;
    }

    const loadInitialReport = async () => {
      try {
        const lastResult = await api.getLastDevopsResult();
        const initialReport = lastResult?.generatedContent?.securityReport;

        if (initialReport) {
          setSummaryReport(initialReport);
        } else {
          setError(
            "No security report found. Please generate one from the DevOps tab first."
          );
        }
      } catch (e) {
        setError(
          "Could not load repository metadata. Please re-scan your project."
        );
      }
    };

    loadInitialReport();
  }, []);

  // Function to trigger the generation of the detailed report
  const handleGenerateDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const repoPath = localStorage.getItem("repoPath");
      // We send a specific, predefined question to get a detailed breakdown
      const detailedQuestion =
        "Please provide a detailed, file-by-file analysis of every issue in the report. For each issue, include a clear explanation of the vulnerability and a code snippet showing the exact fix.";

      const response = await api.chatWithSecurityReport(
        repoPath,
        detailedQuestion
      );
      setDetailedReport(response.recommendations);
    } catch (err) {
      setError(`Failed to generate detailed report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (error && !summaryReport) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <ShieldAlert className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel: The Initial Summary Report */}
      <div className="w-1/3 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4">Issues Summary</h2>
        <Card className="flex-grow p-4 overflow-y-auto">
          <article className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summaryReport || "Loading summary..."}
            </ReactMarkdown>
          </article>
        </Card>
      </div>

      {/* Right Panel: The Detailed Analysis Area */}
      <div className="w-2/3 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4">
          Detailed Analysis & Fixes
        </h2>
        <Card className="flex-grow flex flex-col items-center justify-center p-6">
          {loading ? (
            <>
              <Spinner size="lg" />
              <p className="mt-4 text-gray-300">
                AI is analyzing and generating the report...
              </p>
            </>
          ) : detailedReport ? (
            <div className="w-full h-full overflow-y-auto">
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {detailedReport}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-bold text-white mb-2">
                Generate In-Depth Analysis
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                The AI will analyze each issue from the summary and provide
                detailed explanations and code examples for how to fix them.
              </p>
              <Button
                onClick={handleGenerateDetails}
                variant="primary"
                size="lg"
                disabled={!summaryReport}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Detailed Analysis
              </Button>
              {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SecurityChatView;
