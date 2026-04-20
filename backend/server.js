import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const API_KEY = "AIzaSyCL3YA_FhK-vEkJRwoEV1vcC9pGSwa6a2k";

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    const prompt = `
You are a Smart Event Assistant.
Help users with:
- Event recommendations
- Session timing
- Navigation guidance

User: ${userMessage}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't understand.";

        res.json({ reply });

    } catch (error) {
        res.json({ reply: "Error connecting to AI." });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));