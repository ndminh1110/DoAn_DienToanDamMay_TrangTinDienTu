const axios = require("axios");

// Chia text thành các đoạn <= 500 ký tự
function splitText(text, maxLength = 450) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function translateText(text, targetLang, sourceLang = "auto") {
  try {
    if (!text || text.trim() === "") return text;

    const chunks = splitText(text);
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await axios.get("https://api.mymemory.translated.net/get", {
			params: {
			  q: chunk,
			  langpair: sourceLang === "auto" ? `en|${targetLang}` : `${sourceLang}|${targetLang}`,
			  de: "nguyendominh8@gmail.com"  
			  }
        });
        return response.data.responseData.translatedText;
      })
    );

    return results.join(" ");
  } catch (err) {
    console.error("Lỗi dịch:", err.message);
    return text;
  }
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