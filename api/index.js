export default async function handler(req, res) {
  const { client_id, password, deployment_id } = req.query;

  if (!client_id || !password || !deployment_id) {
    return res.status(400).send("Missing parameters");
  }

  const url = `https://script.google.com/macros/s/${deployment_id}/exec?client_id=${client_id}&password=${password}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!json.data) {
      return res.status(500).send("No data returned");
    }

    // Restituisce HTML dinamico
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(json.data);
  } catch (error) {
    res.status(500).send("Errore nel proxy: " + error.message);
  }
}
