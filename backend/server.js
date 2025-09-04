
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import Url from "./urlModel.js";

const app = express();


app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

mongoose.connect("mongodb://127.0.0.1:27017/urlshortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.post("/api/shorten", async (req, res) => {
  try {
    const { longUrl, customCode, validity } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    let shortCode = customCode || generateCode();

    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(400).json({ error: "Shortcode already exists, choose another" });
    }

    const expiryMinutes = validity ? parseInt(validity, 10) : 30;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

    const newUrl = await Url.create({ longUrl, shortCode, expiresAt });

    res.json({
      shortUrl: `http://localhost:5000/${shortCode}`,
      longUrl,
      expiresAt
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ shortCode: code }); 

    if (!url) {
      return res.status(404).json({ error: "Shortcode not found" });
    }


    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: "Link expired" });
    }


    url.clicks += 1;
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


app.get("/api/stats/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ error: "Shortcode not found" });
    }

    res.json({
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


app.listen(5000, () => console.log("🚀 Backend running at http://localhost:5000"));
