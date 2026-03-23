import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY ?? "";
console.log("Key length:", key.length);
console.log("Key ends with:", JSON.stringify(key.slice(-5)));
const client = new Anthropic({ apiKey: key.trim() });

try {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 10,
    messages: [{ role: "user", content: "hi" }],
  });
  console.log("API OK:", msg.id);
} catch (e: any) {
  console.error("API ERROR:", e.message);
  console.error("Status:", e.status);
}
