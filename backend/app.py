import json
import os
import re

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

allowed_origins = [
    "http://localhost:5173",
    FRONTEND_ORIGIN,
    "https://loglens-ai.vercel.app",
]

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=True,
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-flash-latest"


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "LogLens AI backend is running with Gemini"})


def extract_json(text):
    """
    Gemini may return clean JSON, or it may wrap JSON in markdown fences.
    This helper safely extracts the JSON object.
    """
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```json", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"^```", "", text).strip()
        text = re.sub(r"```$", "", text).strip()

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("No JSON object found in Gemini response.")

    return json.loads(text[start:end + 1])


@app.route("/api/analyze", methods=["OPTIONS", "POST"])
def analyze_issue():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    required_fields = ["title", "source_type", "environment", "raw_input"]
    missing = [field for field in required_fields if not data.get(field)]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing
        }), 400

    if not GEMINI_API_KEY:
        return jsonify({
            "error": "Missing Gemini API key",
            "details": "Add GEMINI_API_KEY to backend/.env and restart Flask."
        }), 500

    title = data.get("title")
    source_type = data.get("source_type")
    environment = data.get("environment")
    tech_stack = data.get("tech_stack", "")
    raw_input = data.get("raw_input")

    prompt = f"""
You are an experienced production support engineer.

Analyze this software issue and return ONLY valid JSON.
Do not include markdown.
Do not include code fences.
Do not include explanation outside the JSON.

The JSON must match this exact shape:

{{
  "summary": "string",
  "severity": "Low | Medium | High | Critical",
  "category": "Frontend | Backend | Database | Authentication | API | Deployment | Infrastructure | Unknown",
  "likely_root_cause": "string",
  "affected_component": "string",
  "suggested_fix": "string",
  "debugging_steps": ["string", "string", "string"],
  "tests_to_add": ["string", "string", "string"],
  "confidence": 0.85
}}

Issue title:
{title}

Source type:
{source_type}

Environment:
{environment}

Tech stack:
{tech_stack}

Raw issue/log/stack trace:
{raw_input}

Rules:
- Be practical and specific.
- Do not invent exact files, services, or business impact unless they appear in the input.
- If the root cause is uncertain, explain what is most likely.
- Debugging steps should be ordered from easiest to most useful.
- Suggested fix should be realistic for a developer.
- Tests should focus on preventing the bug from coming back.
"""

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent"
    )

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        response.raise_for_status()

        gemini_data = response.json()

        text = gemini_data["candidates"][0]["content"]["parts"][0]["text"]
        result = extract_json(text)

        return jsonify(result), 200

    except Exception as error:
        print("GEMINI ERROR:", repr(error))

        return jsonify({
            "error": "AI analysis failed",
            "details": str(error)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", debug=True, port=port)