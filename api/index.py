from flask import Flask, request, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def my_proxy():
    deployment_id = request.args.get("deployment_id")
    client_id = request.args.get("client_id")
    password = request.args.get("password")

    if not deployment_id or not client_id or not password:
        return Response("Missing parameters", status=400)

    # Costruisci la URL di destinazione
    target_url = f"https://script.google.com/macros/s/{deployment_id}/exec"
    params = {
        "client_id": client_id,
        "password": password
    }

    try:
        resp = requests.get(target_url, params=params, timeout=10)
        return Response(resp.content, status=resp.status_code, content_type=resp.headers.get("Content-Type", "text/html"))
    except Exception as e:
        return Response(f"Proxy error: {str(e)}", status=502)
