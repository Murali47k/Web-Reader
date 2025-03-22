from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/tts_from_text', methods=['POST'])
def tts_from_text():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        tts = gTTS(text=text, lang="en")
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        tts.save(temp_file.name)
        temp_file.close()
        return send_file(temp_file.name, mimetype="audio/mpeg", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
