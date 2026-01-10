export interface ChatSources {
  type: string;
  symbol?: string;
  url?: string;
  source?: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSources[];
  tickers: string[];
}

function detectTickers(text: string) {
  const matches = text.match(/\b[A-Z]{2,5}\b/g) || [];
  return Array.from(new Set(matches));
}

async function fetchFinnhubClient(path: string, userKey: string) {
  const url = `https://finnhub.io/api/v1${path}${path.includes("?") ? "&" : "?"}token=${userKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub failed: ${res.status}`);
  return res.json();
}

async function callKimiClient(messages: { role: "system" | "user"; content: string }[], userKey: string, model?: string) {
  const kimiModel = model || "moonshot-v1-128k";
  const resp = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: kimiModel,
      temperature: 0.3,
      messages,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Kimi error ${resp.status}: ${body}`);
  }
  const data = await resp.json();
  const message = data?.choices?.[0]?.message?.content;
  if (!message) throw new Error("Kimi returned no content");
  return message as string;
}

async function clientFallback(prompt: string, articleUrl?: string): Promise<ChatResponse> {
  const kimiKey = typeof localStorage !== "undefined" ? localStorage.getItem("kimi_api_key") : null;
  const finnhubKey = typeof localStorage !== "undefined" ? localStorage.getItem("finnhub_api_key") : null;
  if (!kimiKey) throw new Error("AI request failed");

  const tickers = detectTickers(prompt).slice(0, 3);
  const sources: ChatSources[] = [];
  const contextParts: string[] = [];

  if (finnhubKey && tickers.length) {
    for (const sym of tickers) {
      try {
        const quote = await fetchFinnhubClient(`/quote?symbol=${sym}`, finnhubKey);
        contextParts.push(
          `Quote ${sym}: price ${quote.c}, change ${quote.d} (${quote.dp}%), high ${quote.h}, low ${quote.l}, prev close ${quote.pc}`,
        );
        sources.push({ type: "quote", symbol: sym, url: `https://finnhub.io/quote/${sym}` });
      } catch {
        // ignore
      }
      try {
        const from = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
        const to = Math.floor(Date.now() / 1000);
        const news = await fetchFinnhubClient(`/company-news?symbol=${sym}&from=${from}&to=${to}`, finnhubKey);
        (news as any[]).slice(0, 3).forEach((n) => {
          contextParts.push(`News ${sym}: ${n.headline} (${n.source}) ${n.summary?.slice(0, 180) || ""}`);
          sources.push({ type: "news", symbol: sym, url: n.url, source: n.source });
        });
      } catch {
        // ignore
      }
    }
  }

  if (articleUrl) {
    try {
      const resp = await fetch(articleUrl);
      if (resp.ok) {
        const text = await resp.text();
        contextParts.push(`User provided article content:\n${text.slice(0, 4000)}`);
        sources.push({ type: "article", url: articleUrl });
      }
    } catch {
      // ignore
    }
  }

  const systemPrompt = `
You are a concise equity research assistant. Use only the provided context and cite data/sources; do not fabricate tickers or prices.
Avoid personalized advice; stick to general insights. Mention if data is missing.
`;

  const messages = [
    { role: "system", content: systemPrompt + "\nContext:\n" + contextParts.join("\n") },
    { role: "user", content: prompt },
  ] as const;

  const answer = await callKimiClient(messages as any, kimiKey);
  return { answer, sources, tickers };
}

export async function askAi(prompt: string, articleUrl?: string): Promise<ChatResponse> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, articleUrl }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || "AI request failed");
    }
    return res.json();
  } catch (serverError) {
    // fallback to client-side Kimi + Finnhub if keys are present locally
    return clientFallback(prompt, articleUrl);
  }
}
