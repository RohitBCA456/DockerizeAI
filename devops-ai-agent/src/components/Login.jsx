import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BotMessageSquare } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path
      fill="#4285F4"
      d="M44.5 20H24v8.5h11.8C34.9 33.3 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 3.1l6-6C34.6 4.9 29.7 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.3-.5-4z"
    />
    <path
      fill="#34A853"
      d="M6.3 14.7l6.6 4.8C14.4 16.1 18.8 13 24 13c3.1 0 5.9 1.1 8.1 3.1l6-6C34.6 4.9 29.7 3 24 3c-7.6 0-14.1 4.3-17.7 10.7z"
    />
    <path
      fill="#FBBC05"
      d="M24 45c5.7 0 10.6-1.9 14.1-5.1l-6.5-5.5c-2 1.4-4.6 2.1-7.6 2.1-6.1 0-10.9-3.7-12.7-8.8l-6.6 5.1C9.9 40.3 16.5 45 24 45z"
    />
    <path
      fill="#EA4335"
      d="M44.5 20H24v8.5h11.8c-1.3 3.9-5.1 7-11.8 7-6.1 0-10.9-3.7-12.7-8.8l-6.6 5.1C9.9 40.3 16.5 45 24 45c10.5 0 20-7.6 20-21 0-1.3-.1-2.3-.5-4z"
    />
  </svg>
);

const Login = () => {
  const { login } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 text-white p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-white/20">
        <BotMessageSquare className="w-20 h-20 mx-auto mb-6 text-indigo-300 animate-bounce" />
        
        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          DevOps Agent
        </h1>
        <p className="text-gray-300 mb-10">
          Your AI-powered assistant for generating DevOps configurations, analyzing security, and answering deployment questions.
        </p>

        <button
          onClick={login}
          className="flex items-center justify-center w-full py-3 px-6 bg-white text-gray-800 font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
