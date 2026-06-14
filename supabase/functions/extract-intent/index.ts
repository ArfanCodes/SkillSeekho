const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORY_SLUGS = [
  "photography", "cooking", "tailoring", "language",
  "music", "wellness", "technology", "art-craft",
];

// ── System prompts ─────────────────────────────────────────────────────────

const SYSTEM: Record<string, string> = {
  profile: `You are helping a new user complete their SkillSeekho profile through a short voice introduction.
Extract their personal details from their spoken introduction (which may be in Hindi, Kannada, Tamil, Telugu, or English).
Return ONLY a JSON object with these exact fields:
{
  "mode": "profile",
  "name": "<their full name>",
  "bio": "<1-2 sentence English summary of their background or what they do, or null>",
  "location_name": "<city or neighbourhood in India if mentioned, else null>",
  "languages": ["<languages they speak or teach, English names: Hindi, English, Kannada, etc.>"],
  "availability": "<when available e.g. Weekends, Evenings, Flexible — or null if not mentioned>"
}`,

  search: `You are an intent extraction engine for SkillSeekho, a hyperlocal skill-sharing platform in India.
Extract the learner's skill search intent from their spoken query (which may be in Hindi, Kannada, Tamil, Telugu, or English).
Return ONLY a JSON object with these exact fields:
{
  "mode": "search",
  "skill": "<short English phrase 2-4 words>",
  "category_slug": "<one of: ${CATEGORY_SLUGS.join(", ")} — or null if unclear>",
  "maxPrice": <whole number in INR or null>,
  "area": "<neighbourhood/locality in India if mentioned, else null>"
}`,

  listing: `You are helping a professional teacher create a skill listing on SkillSeekho (India hyperlocal skill platform).
Extract their skill offering details from their spoken description (may be Hindi, Kannada, Tamil, Telugu, or English).
Return ONLY a JSON object with these exact fields:
{
  "mode": "listing",
  "title": "<English title>",
  "category_slug": "<one of: ${CATEGORY_SLUGS.join(", ")}>",
  "price_per_session": <whole number INR, infer ₹200-₹2000 if not stated>,
  "tags": ["<2-5 short English keywords>"],
  "languages": ["<languages they will teach in, English names: Hindi, English, Kannada, Tamil, Telugu, Marathi, Bengali, Urdu, Malayalam — empty array if not mentioned>"],
  "location_name": "<the neighbourhood/area/city in India where they teach, e.g. 'Koramangala, Bangalore' — or null if not mentioned>",
  "availability": "<string or null>",
  "description": "<1-2 sentence English description or null>"
}`,

  onboarding: `You are helping a new professional teacher complete their SkillSeekho profile through a voice introduction.
Extract both their personal profile AND their first skill listing from their spoken introduction
(which may be in Hindi, Kannada, Tamil, Telugu, or English).
Return ONLY a JSON object with these exact fields:
{
  "mode": "onboarding",
  "profile": {
    "name": "<their name>",
    "bio": "<1-2 sentence English summary>",
    "languages": ["<teaching languages, English names: Hindi, English, Kannada, etc.>"],
    "location_name": "<city/area or null>",
    "availability": "<string or null>"
  },
  "skill": {
    "title": "<English skill title>",
    "category_slug": "<one of: ${CATEGORY_SLUGS.join(", ")}>",
    "price_per_session": <whole number INR, infer ₹200-₹1500 if not stated>,
    "tags": ["<2-5 short English keywords>"],
    "availability": "<string or null>"
  }
}`,
};

// ── Edge Function ──────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json() as {
      transcript: string;
      language?: string;
      mode: "search" | "listing" | "onboarding";
    };

    const { transcript, language = "unknown", mode } = body as {
      transcript: string;
      language?: string;
      mode: "search" | "listing" | "onboarding" | "profile";
    };

    if (!transcript?.trim()) return json({ error: "transcript is required" }, 400);
    if (!SYSTEM[mode])       return json({ error: `mode must be one of: ${Object.keys(SYSTEM).join(", ")}` }, 400);

    const result = await callGroq(transcript, language, mode);
    return json(result);
  } catch (err) {
    console.error("[extract-intent]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

// ── Groq call ──────────────────────────────────────────────────────────────

async function callGroq(
  transcript: string,
  language: string,
  mode: "search" | "listing" | "onboarding",
): Promise<unknown> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY secret not set");

  const userPrompt =
    `Detected language: ${language}\nTranscript: "${transcript}"\n\nExtract intent as JSON.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM[mode] },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 512,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no content");

  return JSON.parse(text);
}

// ── Helper ─────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
