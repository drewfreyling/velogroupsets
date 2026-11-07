#!/usr/bin/env python3
"""Read-only staging HTTPS/header/protocol smoke checks; no credentials required."""
import json
import os
import socket
import ssl
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, build_opener, urlopen

HOST = "staging.velogroupsets.com"
BASE = f"https://{HOST}"


def get(url, opener=urlopen):
    try:
        response = opener(url, timeout=20)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def check_hsts(headers):
    directives = {part.strip().lower() for part in headers.get("Strict-Transport-Security", "").split(";")}
    if not {"max-age=31536000", "includesubdomains", "preload"} <= directives:
        raise RuntimeError("Expected one-year HSTS with includeSubDomains and preload.")


def check_http():
    for path, expected in [("/", 200), ("/api/health", 200),
                           ("/components/shimano/fc-r7000/", 200),
                           ("/not-a-real-page/", 404), ("/api/not-implemented", 404)]:
        status, headers, body = get(BASE + path)
        if status != expected:
            raise RuntimeError(f"{path}: expected {expected}, received {status}")
        check_hsts(headers)
        if path.startswith("/api/"):
            if "application/json" not in headers.get("Content-Type", ""):
                raise RuntimeError("API routing returned a non-JSON response.")
        if path == "/api/health":
            health = json.loads(body)
            if health.get("status") != "ok" or health.get("environment") != "staging":
                raise RuntimeError("Worker health check failed.")
            print("Worker release: " + health["release"])
        print(f"HTTPS {path}: {status}; HSTS verified")

    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    status, headers, _ = get(f"http://{HOST}/", build_opener(NoRedirect).open)
    if status not in (301, 308) or headers.get("Location") != BASE + "/":
        raise RuntimeError("HTTP must redirect permanently to the same HTTPS hostname.")
    print("HTTP → HTTPS redirect verified.")


def handshake(version):
    context = ssl.create_default_context()
    context.minimum_version = version
    context.maximum_version = version
    with socket.create_connection((HOST, 443), timeout=15) as connection:
        with context.wrap_socket(connection, server_hostname=HOST) as tls:
            return tls.version(), tls.cipher()[0]


def check_tls():
    if any(os.environ.get(name) for name in ("HTTPS_PROXY", "HTTP_PROXY", "ALL_PROXY", "https_proxy", "http_proxy", "all_proxy")):
        raise RuntimeError("Run TLS probes from a runner without a configured proxy; intercepted TLS cannot establish the edge policy.")
    version, cipher = handshake(ssl.TLSVersion.TLSv1_3)
    if version != "TLSv1.3":
        raise RuntimeError("TLS 1.3 negotiation failed.")
    print(f"Direct TLS 1.3 accepted; certificate validated; negotiated {cipher}.")
    try:
        handshake(ssl.TLSVersion.TLSv1_2)
    except ssl.SSLError as error:
        if error.reason != "TLSV1_ALERT_PROTOCOL_VERSION":
            raise RuntimeError("TLS 1.2 failed for an unexpected reason; protocol rejection is unconfirmed.") from error
        print("Direct TLS 1.2 rejected with a protocol-version alert.")
    else:
        raise RuntimeError("TLS 1.2 was accepted despite the TLS 1.3-only policy.")


if __name__ == "__main__":
    check_http()
    check_tls()
    print("Staging HTTPS smoke checks passed.")
