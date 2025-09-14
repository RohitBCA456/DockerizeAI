// src/api.js

import axios from 'axios';

// Configure your backend's base URL
const API_URL = 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending session cookies
});

// A simple cache to hold the last successful DevOps generation result
let lastDevopsResult = null;

export const api = {
  /**
   * Checks for the currently authenticated user.
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/current_user');
      return response.data;
    } catch (error) {
      // It's normal for this to fail if not logged in
      return null;
    }
  },

  /**
   * Logs the user out.
   */
  logout: async () => {
    await apiClient.get('/api/logout');
  },

  /**
   * Scans a repository and generates DevOps files.
   * @param {string} repoPath The absolute path to the repository.
   */
  generateDevops: async (repoPath) => {
    try {
      const response = await apiClient.post('/generate-devops', { repoPath });
      lastDevopsResult = response.data; // Cache the successful result
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.details || 'Failed to generate DevOps files.');
    }
  },

  /**
   * ❗ THIS IS THE MISSING FUNCTION ❗
   * Sends a question to the platform Q&A agent.
   * @param {string} question The user's question.
   */
  askQuestion: async (question) => {
    try {
      const response = await apiClient.get('/scrape-and-query', { params: { query: question } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.details || 'Failed to get an answer.');
    }
  },

  /**
   * Sends a question to the security report chatbot.
   * @param {string} repoPath The path to the repository.
   * @param {string} question The user's question about the report.
   */
  chatWithSecurityReport: async (repoPath, question) => {
    try {
      const response = await apiClient.post('/chat-security-report', { repoPath, question });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.details || 'Failed to chat about security.');
    }
  },
  
  /**
   * Sends a question to the general DevOps chatbot.
   * @param {string} repoPath The path to the repository.
   * @param {string} question The user's general DevOps question.
   */
  chatWithDevops: async (repoPath, question) => {
    try {
      const response = await apiClient.post('/chat-devops', { repoPath, question });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.details || 'Failed to chat about DevOps.');
    }
  },

  /**
   * Retrieves the last cached result from a successful DevOps generation.
   */
  getLastDevopsResult: () => {
    return lastDevopsResult;
  },
};