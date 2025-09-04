import type { VercelRequest, VercelResponse } from '@vercel/node';

async function keepAliveAttempt(): Promise<{status: number, text: string}> {
  const response = await fetch('https://smartalk.onrender.com/keep_alive');
  const text = await response.text();
  if (response.status === 200) {
    return { status: 200, text };
  } else {
    // ritardo random tra 0 e 5 secondi
    const delay = Math.random() * 5000;
    await new Promise(res => setTimeout(res, delay));
    const retry = await fetch('https://smartalk.onrender.com');
    return { status: retry.status, text: "Home reloaded" };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { status, text } = await keepAliveAttempt();
    res.status(status).json({ response: text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
