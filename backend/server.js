import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// SECURITY: Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet({
    contentSecurityPolicy: false, // Disabling to avoid inline script issues on frontend simplicity
}));

// EFFICIENCY: Compress HTTP responses to save bandwidth.
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// SECURITY / EFFICIENCY: Rate Limiting to prevent spam/abuse
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 25, // limit each IP to 25 requests per windowMs
    message: { reply: "Too many requests, please try again in a minute." }
});

// GOOGLE SERVICES: Official Google Generative AI SDK connection
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "dummy_key");

app.post("/chat", limiter, async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ reply: "Please provide a message." });
        }

        const prompt = `
You are a Smart Event Assistant.
Help users with:
- Event recommendations
- Session timing
- Navigation guidance

User: ${userMessage}
`;
        // Utilize gemini model via SDK
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        
        res.json({ reply });

    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.status(500).json({ reply: "Error processing the AI request due to an internal failure or API limit." });
    }
});

const PORT = process.env.PORT || 3000;
// We export the app for testing purposes
export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} with enhanced security and performance.`));
}