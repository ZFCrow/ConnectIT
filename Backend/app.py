from flask import Flask, jsonify 
from flask_cors import CORS  
import os

app = Flask(__name__) 

# allow all domains to access the API 
CORS(app)


@app.route('/')
def index():
    print ("request from")
    return jsonify({"message": "Welcome to the API!"})


@app.route('/hello')
def hello():
    print ("request from")
    return jsonify({"message": "hello to the API!", "status": 169}) 


if __name__  == "__main__":
    # Read host, port, and debug from env, with sensible defaults
    host  = os.environ.get("FLASK_RUN_HOST", "0.0.0.0")
    port  = int(os.environ.get("FLASK_RUN_PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ("1", "true", "yes")

    app.run(host=host, port=port, debug=debug)
