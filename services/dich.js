const axios = require("axios");

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "http://localhost:5000";

async function translateText(text, targetLang, sourceLang = "auto") {
  const response = await axios.post(`${LIBRETRANSLATE_URL}/translate`, {
    q: text,
    source: sourceLang,
    target: targetLang,
    api_key: "",
  });
  return response.data.translatedText;
}

async function translateArticle(article, targetLangs) {
  const translations = {};
  await Promise.all(
    targetLangs.map(async (lang) => {
      const [translatedTitle, translatedContent] = await Promise.all([
        translateText(article.title, lang),
        translateText(article.content, lang),
      ]);
      translations[lang] = { title: translatedTitle, content: translatedContent };
    })
  );
  return translations;
}

module.exports = { translateText, translateArticle };