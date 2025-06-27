const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let scores = [];

app.post("/api/score", (req, res) => {
    const { player, score } = req.body;
    scores.push({ player, score });
    scores.sort((a, b) => b.score - a.score);
    res.json({ message: "Score saved" });
});

app.get("/api/leaderboard", (req, res) => {
    res.json(scores);
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5173");
});