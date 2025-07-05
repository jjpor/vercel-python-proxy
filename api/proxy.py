def handler(request):
    client_id = request.args.get("client_id")
    password = request.args.get("password")

    if not client_id or not password:
        return {
            "statusCode": 400,
            "body": "Missing client_id or password"
        }

    # Mini logica demo
    if password == "1234":
        return {
            "statusCode": 200,
            "body": f"✅ Access granted for {client_id}"
        }
    else:
        return {
            "statusCode": 401,
            "body": "❌ Invalid credentials"
        }
