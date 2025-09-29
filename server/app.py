from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
import base64
import json
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://md-backend-blond.vercel.app"}})

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Please extract each item’s English product name and price from the image. "
                        "Format like:\n\n[1] MINIVE PLUSH DOLL - 18000 WON\n\n"
                        "Avoid table lines and text like 'No.' or '|---|'."
                    )
                },
                {
                    "role": "user",
                    "content": image_parts
                }
            ],
            max_tokens=1000
        )

        result = response.choices[0].message.content
        return jsonify({"result": result})

    except Exception as e:
        print("OpenAI API 오류:", str(e))
        return jsonify({"error": "GPT 처리 중 오류가 발생했습니다."}), 500

@app.route('/')
def serve_react():
    return send_from_directory('../frontend/build', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend/build', path)

@app.route("/translate-members-en", methods=["POST"])
def translate_members_en():
    data = request.json
    members = data.get("members", [])

    prompt = (
        "다음 멤버 이름을 영어 로마자 표기로 변환해줘. "
        "절대 다른 설명하지 말고, 쉼표(,)로 구분해서 결과만 출력해. "
        f"멤버: {', '.join(members)}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        result = response.choices[0].message.content.strip()
        translated = [m.strip() for m in result.split(",") if m.strip()]

        return jsonify({"translatedMembersEn": translated})

    except Exception as e:
        print("translate-members-en 오류:", str(e))
        return jsonify({"error": "GPT 처리 중 오류"}), 500

@app.route("/translate-members-jp", methods=["POST"])
def translate_members_jp():
    data = request.json
    members = data.get("members", [])

    prompt = (
        "다음 멤버 이름을 일본어 가타카나로 변환해줘. "
        "절대 다른 설명하지 말고, 쉼표(,)로 구분해서 결과만 출력해. "
        f"멤버: {', '.join(members)}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        result = response.choices[0].message.content.strip()
        translated = [m.strip() for m in result.split(",") if m.strip()]

        return jsonify({"translatedMembersJp": translated})

    except Exception as e:
        print("translate-members-jp 오류:", str(e))
        return jsonify({"error": "GPT 처리 중 오류"}), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))  # ← Render가 주는 PORT를 사용
    app.run(host="0.0.0.0", port=port)
