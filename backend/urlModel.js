// backend/urlModel.js
import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Expiry time
  clicks: { type: Number, default: 0 }
});

export default mongoose.model("Url", urlSchema);
