import express from "express";
import morgan from "morgan";
import cors from "cors";
import shortid from "shortid";

const app = express();
const PORT = 5000;


app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const urls = {};

app.post("/api/shorten", (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  const code = shortid.generate();
  const shortUrl = `${req.protocol}://${req.get("host")}/${code}`;

  urls[code] = { longUrl, hits: 0 };

  res.json({ shortUrl, longUrl });
});

app.get("/:code", (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (entry) {
    entry.hits++;
    res.redirect(entry.longUrl);
  } else {
    res.status(404).json({ error: "Short URL not found" });
  }
});

app.get("/api/stats/:code", (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (entry) {
    res.json({ code, longUrl: entry.longUrl, hits: entry.hits });
  } else {
    res.status(404).json({ error: "Short URL not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
