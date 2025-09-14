export default async function handler(req, res) {
  const { deployment_id, action, ...rest } = req.query;

  // URL della tua Web App Google Apps Script
  const SCRIPT_URL = `https://script.google.com/macros/s/${deployment_id}/exec`;

  // Costruisci la query string
  const url = new URL(SCRIPT_URL);
  url.searchParams.set("action", action || "");
  Object.entries(rest).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const response = await fetch(url.toString(), { method: "GET" });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
