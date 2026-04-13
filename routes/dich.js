const express = require("express");
const router = express.Router();
const { translateText } = require("../services/dich");

// Dịch
router.post("/text", async (req, res) => {
  const { text, targetLang, sourceLang = "auto" } = req.body;
  if (!text || !targetLang)
    return res.status(400).json({ error: "Thiếu text hoặc targetLang" });
  try {
    const result = await translateText(text, targetLang, sourceLang);
    res.json({ translatedText: result });
  } catch (err) {
    res.status(500).json({ error: "Dịch thất bại", detail: err.message });
  }
});

module.exports = router;