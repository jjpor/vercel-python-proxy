from http.client import HTTPSConnection
from urllib.parse import urlencode
from flask import Flask, request, Response

app = Flask(__name__)

@app.route("/", methods=["GET"])
def proxy():
    client_id = request.args.get("client_id")
    password = request.args.get("password")
    if not client_id or not password:
        return Response("Missing parameters", status=400)

    # ESEMPIO: costruisci la URL di destinazione
    target_url = f"https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?client_id={client_id}&password={password}"

    conn = HTTPSConnection("script.google.com")
    conn.request("GET", f"/macros/s/YOUR_DEPLOYMENT_ID/exec?client_id={client_id}&password={password}")
    res = conn.getresponse()
    return Response(res.read(), status=res.status, content_type=res.getheader("Content-Type"))
