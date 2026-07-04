import { NextResponse } from 'next/server';

type RequestBody = {
  type: 'characters' | 'scenes' | 'timeline' | 'outline';
  items: unknown[];
};

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'Server not configured for AI. Set OPENAI_API_KEY.' }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const prompt = buildPrompt(body.type, body.items || []);

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful writing assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: 'AI service error', detail: txt }, { status: 502 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ result: content });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to call AI service' }, { status: 500 });
  }
}

function buildPrompt(type: RequestBody['type'], items: unknown[]) {
  switch (type) {
    case 'characters':
      return `You are an expert fiction writer assistant. Given the following characters (JSON array): ${JSON.stringify(
        items
      )}
Respond with: for each character produce a short expanded profile with motivations, conflict hooks, and three potential scene prompts that feature the character. Return results as a JSON array of objects with keys: name, expandedProfile, motivations, conflictHooks, scenePrompts.`;
    case 'scenes':
      return `You are an expert fiction writer assistant. Given the following scenes (JSON array): ${JSON.stringify(
        items
      )}
Respond with: for each scene produce a short scene beat list, key stakes, and a suggested 3-paragraph draft. Return as JSON array with keys: title, beats, stakes, draft.`;
    case 'timeline':
      return `You are an expert fiction writer assistant. Given the following timeline events (JSON array): ${JSON.stringify(
        items
      )}
Respond with: produce a cleaned chronological timeline with suggested causal links and 3 ideas to increase tension.`;
    case 'outline':
      return `You are an expert fiction writer assistant. Given the following outline notes (JSON array): ${JSON.stringify(
        items
      )}
Respond with: a polished 3-act outline with act summaries and three scene ideas per act. Return as JSON.`;
    default:
      return `Generate helpful writing guidance based on: ${JSON.stringify(items)}`;
  }
}
