export default async function handler(req, res) {
     
  // prendo req.body e tolgo deployment_id
  // URL della tua Web App Google Apps
  const { deployment_id, ...cleanBody } = req.body;
  const SCRIPT_URL = `https://script.google.com/macros/s/${deployment_id}/exec`;
  
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanBody),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
