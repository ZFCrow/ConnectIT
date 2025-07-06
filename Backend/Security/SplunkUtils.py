import os
import requests
import json
import socket
from dotenv import load_dotenv

load_dotenv()


class SplunkLogger:
    def __init__(self):
        self.hec_url = os.getenv("SPLUNK_HEC_URL")
        self.token = os.getenv("SPLUNK_HEC_TOKEN")
        self.source = os.getenv("SPLUNK_SOURCE", "flask")
        self.sourcetype = os.getenv("SPLUNK_SOURCETYPE", "flask_logs")
        self.hostname = socket.gethostname()
        self.debug = os.getenv("SPLUNK_DEBUG", "False").lower() == "true"

    def get_real_ip(self, request):
        xff = request.headers.get('X-Forwarded-For')
        if xff:
            return xff.split(',')[0].strip()
        return request.remote_addr

    def send_log(self, event_data):
        headers = {
            "Authorization": f"Splunk {self.token}",
            "Content-Type": "application/json",
        }

        payload = {
            "event": event_data,
            "source": self.source,
            "sourcetype": self.sourcetype,
            "host": self.hostname,
        }

        try:
            response = requests.post(
                self.hec_url,
                data=json.dumps(payload),
                headers=headers,
                verify=False,
                timeout=60,
            )

            if self.debug:
                print(f"[SplunkLogger] Log sent to Splunk: {payload}")
                print(f"[SplunkLogger] Response status code: {response.status_code}")

        except Exception as e:
            print(f"[SplunkLogger] Failed to send log to Splunk: {e}")
