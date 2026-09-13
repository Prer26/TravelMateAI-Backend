import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing!");
} else {
  console.log("✅ GROQ_API_KEY detected");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `
You are TravelMate AI, an expert travel assistant.

Help users plan trips clearly and practically.

When appropriate, provide:
- Day-wise itinerary
- Budget breakdown in INR
- Best time to visit
- Top attractions
- Travel tips
- Food recommendations
- Transportation options
- Hotel/accommodation suggestions

Keep responses friendly, useful, and easy to read.
Use Indian Rupees (₹) for budgets unless the user requests another currency.
`;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TravelMate Backend Running 🚀",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("📩 Received message:", message);

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const reply = response.choices?.[0]?.message?.content;

    console.log("🤖 Groq response received");

    if (!reply) {
      return res.status(500).json({
        success: false,
        error: "Groq returned an empty response",
      });
    }

    return res.status(200).json({
      success: true,
      reply: reply,
    });

  } catch (error) {
    console.error("=================================");
    console.error("❌ GROQ/BACKEND ERROR");
    console.error(error);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unknown backend error",
    });
  }
});

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🔥 TravelMate Backend Started");
  console.log(`🚀 Port: ${PORT}`);
  console.log("=================================");
});