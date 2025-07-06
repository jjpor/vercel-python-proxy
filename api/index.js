export default async function handler(req, res) {
  const { client_id, password, deployment_id } = req.query;

  if (!client_id || !password || !deployment_id) {
    return res.status(400).send("Missing parameters");
  }

  const url = `https://script.google.com/macros/s/${deployment_id}/exec?client_id=${client_id}&password=${password}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(text);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Proxy error");
  }
}
