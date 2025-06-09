from flask import Flask, jsonify 
from flask_cors import CORS  
import os
from db import sshFlow, noSshFlow
app = Flask(__name__) 
import dotenv
from SQLModels.base import initDatabase

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

@app.route('/test')
def test(): 
    # useSSH = os.environ.get("USE_SSH_TUNNEL",6 "False").lower() in ("1", "true", "yes")
    useSSH = os.environ.get("USE_SSH_TUNNEL") in ("1", "true", "yes") 
    if useSSH:
        print ("ssh is turned on")
        ans = sshFlow() 
        return jsonify({"message": "database records fetched from API! ssh", "status": 169, "ans": ans, "useSSH": useSSH})  
    else: 
        print ("ssh is turned off") 
        ans = noSshFlow() 
        return jsonify({"message": "database records fetched from API! no ssh", "status": 169, "ans": ans, "useSSH": useSSH})  

@app.route('/initDB')
def init_db():
    
    tables = initDatabase()
    print (f"Tables in the database: {tables}") 
    return jsonify({"message": "Database initialized successfully!",
                    "tables": [str(table[0]) for table in tables]})  
        

if __name__  == "__main__":
    #! for tssting purposes , we load the .env file and .env.dev 
    dotenv.load_dotenv('.env')
    dotenv.load_dotenv('.env.dev')  
    # Read host, port, and debug from env, with sensible defaults
    host  = os.environ.get("FLASK_RUN_HOST")
    port  = int(os.environ.get("FLASK_RUN_PORT"))
    debug = os.environ.get("FLASK_DEBUG").lower() in ("1", "true", "yes")

    app.run(host=host, port=port, debug=debug)
