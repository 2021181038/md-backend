from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
from openai import (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIStatusError,
)
import os
import base64
import json
import re
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://md-backend-blond.vercel.app"}})
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#test

def error_response(message, code, status, retryable=False):
    return jsonify({
        "error": message,
        "code": code,
        "retryable": retryable,
    }), status


def classify_openai_error(exc):
    if isinstance(exc, AuthenticationError):
        return error_response(
            "OpenAI API 키가 유효하지 않습니다. Render 환경 변수를 확인해주세요.",
            "OPENAI_AUTH",
            401,
            retryable=False,
        )

    if isinstance(exc, RateLimitError):
        return error_response(
            "OpenAI 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
            "OPENAI_RATE_LIMIT",
            429,
            retryable=True,
        )

    if isinstance(exc, APITimeoutError):
        return error_response(
            "OpenAI 응답 시간이 초과되었습니다. 다시 시도해주세요.",
            "OPENAI_TIMEOUT",
            504,
            retryable=True,
        )

    if isinstance(exc, APIConnectionError):
        return error_response(
            "OpenAI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
            "OPENAI_CONNECTION",
            503,
            retryable=True,
        )

    if isinstance(exc, APIStatusError):
        message = str(exc).lower()
        if "insufficient_quota" in message or "billing" in message or "quota" in message:
            return error_response(
                "OpenAI 사용 한도 또는 잔액이 부족합니다. Billing 페이지를 확인해주세요.",
                "OPENAI_QUOTA",
                402,
                retryable=False,
            )
        if exc.status_code >= 500:
            return error_response(
                "OpenAI 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                "OPENAI_SERVER",
                502,
                retryable=True,
            )

    message = str(exc).lower()
    if "insufficient_quota" in message or "billing" in message:
        return error_response(
            "OpenAI 사용 한도 또는 잔액이 부족합니다. Billing 페이지를 확인해주세요.",
            "OPENAI_QUOTA",
            402,
            retryable=False,
        )

    return error_response(
        f"GPT 처리 중 오류가 발생했습니다: {exc}",
        "OPENAI_ERROR",
        500,
        retryable=True,
    )


def parse_products_from_gpt(content):
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return None

    products = data.get("products", [])
    if not isinstance(products, list):
        return None

    cleaned = []
    for product in products:
        if not isinstance(product, dict):
            continue

        name = str(product.get("name", "")).strip()
        if not name:
            continue

        price_raw = product.get("price", 0)
        if price_raw in (None, ""):
            price_val = 0
        else:
            price_val = int(re.sub(r"[^\d]", "", str(price_raw)) or 0)

        cleaned.append({"name": name, "price": price_val})

    return cleaned


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response


def get_image_mime(file):
    mime = (file.content_type or file.mimetype or "image/jpeg").split(";")[0].strip().lower()
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
    if mime == "image/jpg":
        mime = "image/jpeg"
    if mime not in allowed:
        mime = "image/jpeg"
    return mime


@app.route("/extract-md", methods=["POST"])
def extract_md():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not os.getenv("OPENAI_API_KEY"):
        return error_response(
            "서버에 OpenAI API 키가 설정되지 않았습니다.",
            "MISSING_API_KEY",
            503,
            retryable=False,
        )

    files = request.files.getlist('images')

    if not files:
        return error_response(
            "이미지가 업로드되지 않았습니다.",
            "MISSING_IMAGES",
            400,
            retryable=False,
        )

    image_parts = []
    for file in files:
        image_data = base64.b64encode(file.read()).decode('utf-8')
        mime = get_image_mime(file)
        image_parts.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{mime};base64,{image_data}"
            }
        })

    try:
        system_prompt = """You extract product names and Korean Won prices from merchandise images.

Return ONLY valid JSON in this exact shape:
{
  "products": [
    { "name": "MINIVE PLUSH DOLL", "price": 18000 },
    { "name": "PHOTOCARD SET", "price": 5000 }
  ]
}

Rules:
1. Include every visible product row from the image(s)
2. Use English product names (romanize Korean if needed)
3. price must be an integer in Korean Won with no commas or currency symbols
4. Ignore table headers, borders, No., and decorative text
5. If price is unreadable, use 0
6. Do not wrap JSON in markdown or add any extra keys"""

        user_prompt = "Extract all products and prices from these images. Return JSON only."

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        *image_parts
                    ]
                }
            ],
            response_format={"type": "json_object"},
            max_tokens=4000,
            temperature=0.1,
        )

        result = response.choices[0].message.content
        if not result or not result.strip():
            return error_response(
                "이미지에서 상품 정보를 찾지 못했습니다. 더 선명한 이미지로 다시 시도해주세요.",
                "EMPTY_RESULT",
                422,
                retryable=True,
            )

        products = parse_products_from_gpt(result)
        if products is None:
            return jsonify({"result": result})

        if not products:
            return error_response(
                "이미지에서 상품 정보를 찾지 못했습니다. 더 선명한 이미지로 다시 시도해주세요.",
                "EMPTY_RESULT",
                422,
                retryable=True,
            )

        return jsonify({"products": products})

    except Exception as e:
        print("OpenAI API 오류:", str(e))
        return classify_openai_error(e)


@app.route('/')
def serve_react():
    return send_from_directory('../frontend/build', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend/build', path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port)
