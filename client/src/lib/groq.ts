const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface NLSearchResult {
  location?: string;
  maxPrice?: number;
  minPrice?: number;
  amenities?: string[];
  propertyType?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a search query parser for a property rental platform called CozyStay. 
Extract structured filter information from the user's natural language query.
Return ONLY valid JSON with these optional fields: location (string), maxPrice (number), minPrice (number), amenities (array of strings), propertyType (string).
If you cannot parse the query at all, return {"error": "Could not understand query"}. Do not include any text outside the JSON.`;

export async function parseSearchQuery(query: string): Promise<NLSearchResult> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as NLSearchResult;
  } catch (e) {
    return { error: 'Search service unavailable. Try manual filters.' };
  }
}
