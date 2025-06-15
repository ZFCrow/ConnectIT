from flask import Flask, jsonify, request
from flask_cors import CORS  
import os
from db import sshFlow, noSshFlow

import dotenv
from SQLModels.base import DatabaseContext
from Control.PostControl import PostControl
from Boundary.Mapper.PostMapper import PostMapper
from Boundary.AccountBoundary import AccountBoundary

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
    
    db = DatabaseContext() 
    success = db.initialize()  # Initialize the database connection and create tables if they don't exist 
    if success: 
        tables = db.get_tables()  # Get the list of tables in the database 

        print (f"Tables in the database: {tables}") 
        return jsonify({
                        "message": "Database initialized successfully!",
                        "tables": tables})  
    else: 
        return jsonify({"message": "Database initialization failed!"}), 500 
    
@app.route('/profile/<int:account_id>', methods=['GET'])
def get_user(account_id):
    account = AccountBoundary.viewAccount(account_id)

    if account:
        base_data = {
            "accountId": account.accountId,
            "name": account.name,
            "email": account.email,
            "passwordHash": account.passwordHash,
            "passwordSalt": account.passwordSalt,
            "role": account.role,
            "isDisabled": account.isDisabled,
            "profilePicUrl": account.profilePicUrl
        }

        optional_keys = ["bio", "portfolioUrl", "description", "location", "verified"]
        optional_data = {key: getattr(account, key) for key in optional_keys if hasattr(account, key)}

        return jsonify({**base_data, **optional_data})
    
    else:
        return jsonify({"error": "Account not found"}), 404

@app.route('/register', methods=['POST'])
def register():
    accountData = request.get_json()
    success = AccountBoundary.registerAccount(accountData)

    if success:
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create account"}), 500
    
@app.route('/profile/save', methods=['POST'])
def save_profile():
    updated_data = request.get_json()
    success = AccountBoundary.saveProfile(updated_data)

    if success:
        return jsonify({"message": "Profile saved successfully!"}), 201
    else:
        return jsonify({"error": "Failed to save profile"}), 500
    
@app.route('/profile/disable/<int:account_id>', methods=['POST'])
def disable(account_id):
    success = AccountBoundary.disableAccount(account_id)

    if success:
        return jsonify({"message": "Account disabled successfully!"}), 201
    else:
        return jsonify({"error": "Failed to disable account"}), 500
    
@app.route('/post/<int:post_id>')
def get_post(post_id):
    """
    Fetch a post by its ID. 
    #! testing purposes , shouldnt go to mapper straight! 
    """
   
    post = PostMapper.getPostById(post_id)
    
    if post:
        return jsonify({
            "id" : post.post_id, 
            "user" : "",
            "date" : post.date,
            "labels": [],
            "title" : post.title,
            "content" : post.content,
            "comments": [{
                "username": "ZFCrow",
                "content": "WTf?", 
                "accountId": 2, 
                "commentId": 1} ], 
            "likes": 0,
            "liked": False, 
            "accountId": post.account_id, 
        })
    else:
        return jsonify({"error": "Post not found"}), 404 

@app.route('/posts', methods=['GET']) 
def get_all_posts():
    """
    Retrieve all posts from the database.
    """
    
    posts = PostControl.retrieveAllPosts()
    
    if posts:
        return jsonify([{
            "id": post.post_id,
            "user": "",
            "date": post.date,
            "labels": [],
            "title": post.title,
            "content": post.content,
            "comments": [{"user": "ZFCrow","content": "WTf? "} ],
            "likes": 0,
            "liked": False,
            "accountId": post.account_id,
        } for post in posts]), 200
    else:
        return jsonify({"error": "No posts found"}), 404 
    
@app.route('/createPost', methods=['POST']) 
def createPost(accountId: int , postData: dict):
    """
    Create a new post in the database.
    """
   
    success = PostControl.createPost(accountId, postData)
    
    if success:
        return jsonify({"message": "Post created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create post"}), 500
     
if __name__  == "__main__":
  
    # Read host, port, and debug from env, with sensible defaults
    host  = os.environ.get("FLASK_RUN_HOST")
    port  = int(os.environ.get("FLASK_RUN_PORT"))
    debug = os.environ.get("FLASK_DEBUG").lower() in ("1", "true", "yes")

    app.run(host=host, port=port, debug=debug)
