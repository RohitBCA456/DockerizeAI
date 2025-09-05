import mongoose, { Schema } from "mongoose";

const githubShema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    followers: {
      type: Number,
    },
    following: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
    },
    accessToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", githubShema);
