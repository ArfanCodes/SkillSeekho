const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return json({ error: "Expected multipart/form-data with an 'audio' field" }, 400);
    }

    const form = await req.formData();
    const audioField = form.get("audio");
    const langHint = (form.get("lang_hint") as string | null) ?? "";

    if (!audioField || !(audioField instanceof File)) {
      return json({ error: "Missing required field: audio (File)" }, 400);
    }

    // Route: English → Groq Whisper, everything else → Sarvam saarika:v2
    const result = langHint === "en"
      ? await groqTranscribe(audioField)
      : await sarvamTranscribe(audioField, langHint);

    return json(result);
  } catch (err) {
    console.error("[transcribe]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

// ── Helpers ─────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function fileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

// ── Sarvam AI — Indic + English ASR ─────────────

const SARVAM_LANG: Record<string, string> = {
  hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN",
  ml: "ml-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN",
};

async function sarvamTranscribe(
  file: File,
  langHint: string,
): Promise<{ transcript: string; language: string; provider: string }> {
  const apiKey = Deno.env.get("SARVAM_API_KEY");
  if (!apiKey) throw new Error("SARVAM_API_KEY secret not set");

  const form = new FormData();
  // Re-wrap so we control the filename (Sarvam uses it to detect format)
  // Sarvam rejects 'audio/webm;codecs=opus' — strip the codec parameter
  const mimeType = (file.type || "audio/webm").split(";")[0];
  form.append(
    "file",
    new File([await fileBytes(file)], "audio.webm", { type: mimeType }),
  );
  form.append("model", "saarika:v2.5");

  const langCode = SARVAM_LANG[langHint];
  if (langCode) form.append("language_code", langCode);
  // If no hint, Sarvam auto-detects among supported Indic languages + en-IN

  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: form,
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sarvam error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    transcript: String(data.transcript ?? "").trim(),
    language: String(data.language_code ?? "unknown"),
    provider: "sarvam",
  };
}

// ── Groq Whisper — English ASR ──────────────────

async function groqTranscribe(
  file: File,
): Promise<{ transcript: string; language: string; provider: string }> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY secret not set");

  const form = new FormData();
  form.append(
    "file",
    new File([await fileBytes(file)], "audio.webm", { type: file.type || "audio/webm" }),
  );
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "verbose_json");
  form.append("language", "en");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    transcript: String(data.text ?? "").trim(),
    language: String(data.language ?? "en"),
    provider: "groq",
  };
}
