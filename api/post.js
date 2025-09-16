export default async function handler(req, res) {
  // Log della richiesta in ingresso
  console.log("POST /api/post received", {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  const { deployment_id, ...cleanBody } = req.body;

  if (!deployment_id) {
    console.log("Error: deployment_id mancante");
    return res.status(400).json({ success: false, error: "deployment_id mancante" });
  }

  const SCRIPT_URL = `https://script.google.com/macros/s/${deployment_id}/exec`;
  console.log("Forwarding to Apps Script URL:", SCRIPT_URL);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanBody),
    });

    // Log del testo di risposta grezza
    const respText = await response.text();
    console.log("Response from Apps Script (text):", respText);

    // Prova a parsare JSON solo se sembra JSON
    let data;
    try {
      data = JSON.parse(respText);
    } catch (parseErr) {
      console.log("JSON parse error:", parseErr);
      // qui puoi restituire un errore custom
      return res.status(500).json({ success: false, error: "Risposta non JSON da Apps Script", raw: respText });
    }

    console.log("Parsed data:", data);
    return res.status(200).json(data);

  } catch (err) {
    console.log("Fetch/Proxy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
