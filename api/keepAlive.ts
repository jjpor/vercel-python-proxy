import type { VercelRequest, VercelResponse } from "@vercel/node";

async function keepAliveAttempt(object: string): Promise<{ status: number; text: string }> {
  let baseUrl = "";
  if (object === "1") baseUrl = "https://smartalk.onrender.com";
  if (object === "2") baseUrl = "https://constructo-website.onrender.com";

  const response = await fetch(`${baseUrl}/keep_alive`);
  const text = await response.text();

  if (response.status === 200) {
    return { status: 200, text };
  } else {
    // ritardo random tra 0 e 5 secondi
    const delay = Math.random() * 5000;
    await new Promise(res => setTimeout(res, delay));
    const retry = await fetch(baseUrl);
    return { status: retry.status, text: "Home reloaded" };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const object = req.query.object as string | undefined;

    if (object !== "1" && object !== "2") {
      return res.status(400).json({ error: "Error on 'object' query parameter" });
    }

    const { status, text } = await keepAliveAttempt(object);
    res.status(status).json({ response: text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
