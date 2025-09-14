// src/components/QAChatView.jsx

import React, { useState } from 'react';
import { api } from '../api';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { Send, Bot, User } from 'lucide-react';

const QAChatView = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ask me anything about deploying your project!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askQuestion(input);
      const botMessage = { sender: 'bot', text: response.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: 'bot', text: `Sorry, an error occurred: ${err.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Deployment Q&A</h1>
      <Card className="flex-grow flex flex-col p-0">
        <div className="flex-grow p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <Bot className="w-6 h-6 text-indigo-400 flex-shrink-0" />}
              <div className={`p-4 rounded-lg max-w-lg ${msg.sender === 'bot' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-600 text-white'}`}>
                <p>{msg.text}</p>
              </div>
              {msg.sender === 'user' && <User className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <Bot className="w-6 h-6 text-indigo-400" />
              <div className="p-4 rounded-lg bg-gray-700 text-gray-200">
                <Spinner size="sm" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Vercel, Docker, Netlify..."
              className="w-full bg-gray-900 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default QAChatView;