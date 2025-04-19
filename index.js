const express = require("express");
const bodyParser = require("body-parser");
const { crackHash } = require("./hashCracker");
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.post("/crack", async (req, res) => {
  const { hash } = req.body;

  if (!hash || typeof hash !== "string") {
    return res.status(400).json({ error: "Invalid or missing hash" });
  }

  const result = await crackHash(hash.toLowerCase());

  if (result) {
    res.json({ hash, result });
  } else {
    res.status(404).json({ error: "Hash not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
