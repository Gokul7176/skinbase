import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { ingredients, userId } = req.body;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Suggest meals using the following ingredients: ${ingredients.join(", ")}. Respond in short bullet points.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      res.status(200).json({ mealSuggestions: text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}