export default async function handler(req, res) {
  const { client_id, password, deployment_id } = req.query;

  if (!client_id || !password || !deployment_id) {
    return res.status(400).send("Missing one or more parameters: client_id, password, deployment_id");
  }

  const scriptUrl = `https://script.google.com/macros/s/${deployment_id}/exec?client_id=${encodeURIComponent(client_id)}&password=${encodeURIComponent(password)}`;

  try {
    const response = await fetch(scriptUrl);
    const contentType = response.headers.get("content-type") || "";

    const body = await response.text();

    res.setHeader("Content-Type", contentType);
    return res.status(response.status).send(body);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).send("Proxy error while calling Apps Script");
  }
}
