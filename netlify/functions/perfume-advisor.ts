import { GoogleGenAI, Type, Schema } from '@google/genai';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 10;
const TIMEOUT_MS = 20000; // 20 seconds

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RECOMMENDATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    consultantNote: {
      type: Type.STRING,
      description: 'A brief, elegant introduction from the master perfumer in warm Persian addressing the user.',
    },
    recommendations: {
      type: Type.ARRAY,
      description: 'Exactly 3 renowned global perfumes from world-famous houses matching the user taste.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Name of the fragrance from world-renowned houses (e.g. Creed Aventus, Kilian Angels’ Share).',
          },
          brand: {
            type: Type.STRING,
            description: 'Global fragrance house brand name (e.g. Creed, Tom Ford, Parfums de Marly).',
          },
          scentFamily: {
            type: Type.STRING,
            description: 'Olfactory family or vibe in Persian (e.g. چوبی کهربایی، مرکباتی معطر، شرقی وانیلی).',
          },
          topNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key top olfactory notes.',
          },
          heartNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key heart olfactory notes.',
          },
          baseNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key base olfactory notes.',
          },
          reason: {
            type: Type.STRING,
            description: 'Detailed yet concise poetic reason in Persian why this matches the user input.',
          },
          seasonOrOccasion: {
            type: Type.STRING,
            description: 'Best season or occasion to wear in Persian.',
          },
        },
        required: ['name', 'brand', 'scentFamily', 'reason'],
      },
    },
  },
  required: ['consultantNote', 'recommendations'],
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    if (rateLimitMap.size > 1000) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetAt) rateLimitMap.delete(key);
      }
    }
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  record.count += 1;
  return true;
}

function getClientIp(headers: Record<string, string | undefined>): string {
  const forwarded = headers['x-forwarded-for'] || headers['client-ip'] || headers['x-nf-client-connection-ip'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

async function processRequest(
  method: string,
  rawBody: string | null | any,
  headers: Record<string, string | undefined>
): Promise<{ statusCode: number; body: string }> {
  if (method === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }

  if (method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }),
    };
  }

  const clientIp = getClientIp(headers);
  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }),
    };
  }

  let body: any;
  try {
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'INVALID_JSON' }),
    };
  }

  if (!body || typeof body !== 'object') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'INVALID_BODY' }),
    };
  }

  const rawText = typeof body.text === 'string' ? body.text.trim() : '';
  if (rawText.length < 2 || rawText.length > 300) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'INVALID_TEXT_LENGTH' }),
    };
  }

  const lang = body.lang;
  if (lang !== 'fa' && lang !== 'en') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'INVALID_LANGUAGE' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length === 0) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'API_KEY_UNAVAILABLE' }),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the Chief Scent Advisor and Master Perfumer for Maison Rayeha, an ultra-luxury niche perfume atelier. Your objective is to recommend EXACTLY 3 niche perfumes from our curated catalog that strictly align with the user's fragrance query.

STRICT RECOMMENDATION RULES:
1. MANDATORY NOTE MATCHING: Every recommended perfume MUST contain the primary olfactory note requested by the user (e.g., if the user requests Chocolate, every perfume MUST explicitly contain Cocoa, Cacao, or Gourmand accords). NEVER suggest unrelated dark/smoky perfumes like Black Afgano for chocolate/sweet requests.
2. TAILORED REASON: The 'reason' field MUST be unique for each perfume and directly explain HOW its specific notes satisfy the query. Strictly avoid generic or repeated placeholder texts.
3. ACCURATE PYRAMIDS: Provide precise Top, Heart, and Base notes corresponding to real Fragrantica/brand specifications.
4. LANGUAGE & TONE: Persian (fa). Tone: Royal, poetic, sophisticated, and deeply knowledgeable about niche perfumery.`;

    const prompt = `سلیقه و درخواست بویایی کاربر:
"${rawText}"

لطفاً دقیقاً ۳ عطر معروف، اصیل و برتر جهان (برندهای بین‌المللی دنیای عطر) که بیشترین همخوانی با این رایحه را دارند پیشنهاد بده.`;

    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS);
    });

    const executeCall = async () => {
      try {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: RECOMMENDATION_SCHEMA,
            temperature: 0.7,
          },
        });
      } catch {
        return await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: RECOMMENDATION_SCHEMA,
            temperature: 0.7,
          },
        });
      }
    };

    let response: any;
    try {
      response = await Promise.race([executeCall(), timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
    const responseText = response?.text;

    if (!responseText) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'EMPTY_UPSTREAM_RESPONSE' }),
      };
    }

    const parsed = JSON.parse(responseText);
    if (!parsed || !Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'INVALID_UPSTREAM_STRUCTURE' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        consultantNote: parsed.consultantNote || '',
        recommendations: parsed.recommendations,
        source: 'ai',
      }),
    };
  } catch (err: any) {
    if (err?.message === 'TIMEOUT') {
      return {
        statusCode: 504,
        body: JSON.stringify({ error: 'REQUEST_TIMEOUT' }),
      };
    }
    // Never expose API key, raw upstream bodies or stack traces
    console.error('[perfume-advisor] Upstream processing failure');
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'UPSTREAM_ERROR' }),
    };
  }
}

// Netlify Functions Handler (AWS Lambda format)
export const handler = async (event: any) => {
  const method = event.httpMethod || 'GET';
  const headers = event.headers || {};
  const rawBody = event.body;

  const result = await processRequest(method, rawBody, headers);

  return {
    statusCode: result.statusCode,
    headers: CORS_HEADERS,
    body: result.body,
  };
};

// Netlify Functions v2 format (Web Request/Response)
export default async function (req: Request) {
  const method = req.method;
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((val, key) => {
    headers[key.toLowerCase()] = val;
  });

  let rawBody: any = null;
  if (method === 'POST') {
    try {
      rawBody = await req.json();
    } catch {
      rawBody = null;
    }
  }

  const result = await processRequest(method, rawBody, headers);

  return new Response(result.body, {
    status: result.statusCode,
    headers: CORS_HEADERS,
  });
}
