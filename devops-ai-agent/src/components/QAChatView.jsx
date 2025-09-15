// DevOpsView.js
import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import Button from "./ui/Button";
import Spinner from "./ui/Spinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send } from "lucide-react";

const QAChatView = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Fetch initial chat history on component load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getChatHistory();
        setMessages(history);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
        // You could set an error message in the chat UI here
      }
    };
    fetchHistory();
  }, []);

  // Auto-scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

 const handleSendMessage = async (e) => {
  e.preventDefault();
  const question = currentQuestion.trim();
  if (!question || loading) return;

  const userMessage = { role: 'human', content: question };
  
  // 1. Add the user's message to the state
  setMessages(prev => [...prev, userMessage]);
  setCurrentQuestion("");
  setLoading(true);

  try {
    const data = await api.askDevopsBot(question);
    const aiMessage = { role: 'ai', content: data.response };

    // ✅ FIX: Use a callback to get the LATEST state
    // This ensures we are adding the AI's message to the array
    // that already contains the user's new message.
    setMessages(currentMessages => [...currentMessages, aiMessage]);

  } catch (err) {
    const errorMessage = { 
      role: 'ai', 
      content: `Sorry, an error occurred: ${err.message || 'Please try again.'}` 
    };
    // Also use a callback here for consistency
    setMessages(currentMessages => [...currentMessages, errorMessage]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700 text-center">
        <h1 className="text-xl font-bold">DevOps Assistant</h1>
      </div>

      <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'human' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${msg.role === 'human' ? 'bg-indigo-500' : 'bg-gray-600'}`}>
              {msg.role === 'human' ? 'U' : 'AI'}
            </div>
            <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.role === 'human' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <article className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                 </ReactMarkdown>
              </article>
            </div>
          </div>
        ))}
         {loading && (
            <div className="flex items-start gap-3 flex-row">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-600">AI</div>
                 <div className="bg-gray-700 rounded-lg p-3">
                    <Spinner size="sm" />
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask anything about DevOps or deployment..."
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <Button type="submit" variant="primary" disabled={loading || !currentQuestion} size="lg">
            <Send className="w-5 h-5"/>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QAChatView;