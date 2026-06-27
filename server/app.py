from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
import base64
from dotenv import load_dotenv

# 여기변경
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://md-backend-blond.vercel.app"}})
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

@app.route("/extract-md", methods=["POST"])
def extract_md():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    files = request.files.getlist('images')  # ✅ 여러 개의 이미지 받기

    if not files:
        return jsonify({"error": "이미지가 업로드되지 않았습니다."}), 400

    image_parts = []
    for file in files:
        image_data = base64.b64encode(file.read()).decode('utf-8')
        image_parts.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_data}"
            }
        })

    try:
        # 개선된 프롬프트: 더 구체적이고 정확한 추출을 위한 지시사항
        system_prompt = """You are an expert at extracting product information from images. 
Extract each product's English name and price (in Korean Won) from the image(s).

CRITICAL RULES:
1. Extract ONLY product names and prices - ignore table borders, headers, "No.", "|---|", etc.
2. Product names should be in English (romanized if needed)
3. Prices must be in Korean Won (원, WON, ₩) - extract the numeric value only
4. Format each item as: [number] PRODUCT_NAME - PRICE WON
5. Be precise - do not include extra text, dashes, or formatting characters
6. If price is unclear or missing, use empty string for price
7. Number each item sequentially starting from 1

Example output format:
[1] MINIVE PLUSH DOLL - 18000 WON
[2] PHOTOCARD SET - 5000 WON
[3] POSTER - 12000 WON"""

        user_prompt = "Extract all products and their prices from these images. Follow the format exactly."

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
            max_tokens=2000,  # 더 많은 토큰으로 긴 목록 처리
            temperature=0.1,  # 낮은 temperature로 일관성 향상
        )

        result = response.choices[0].message.content
        return jsonify({"result": result})

    except Exception as e:
        print("OpenAI API 오류:", str(e))
        return jsonify({"error": f"GPT 처리 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route('/')
def serve_react():
    return send_from_directory('../frontend/build', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend/build', path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))  # ← Render가 주는 PORT를 사용
    app.run(host="0.0.0.0", port=port)
