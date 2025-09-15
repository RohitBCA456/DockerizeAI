// models/ChatMessage.js
import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // This should match the name of your User model
    required: true,
  },
  role: {
    type: String,
    enum: ["human", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);