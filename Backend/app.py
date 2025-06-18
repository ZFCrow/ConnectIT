
# from pathlib import Path
# from dotenv import load_dotenv , find_dotenv 
# # Read host, port, and debug from env, with sensible defaults
# # automatically finds the nearest .env file by walking up
# env_path = find_dotenv(usecwd=True)
# if not env_path:
#     raise RuntimeError("Couldn't locate a .env file")
# load_dotenv(env_path, override=False)

# # then load .env.dev if present, overriding vars
# dev_env = Path(env_path).parent / ".env.dev"
# if dev_env.exists():
#     load_dotenv(dev_env, override=True)



from flask import Flask, jsonify , request
from flask_cors import CORS  
import os
from db import sshFlow, noSshFlow
from SQLModels.base import DatabaseContext
from Boundary.Mapper.PostMapper import PostMapper
from Boundary.PostBoundary import PostBoundary 
from Boundary.LabelBoundary import LabelBoundary 
from Boundary.ViolationBoundary import ViolationBoundary
import traceback


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
    
@app.route('/post/<int:post_id>', methods = ["POST"])
def delete_post(post_id):
    """
    Delete a post by its ID. 
    """
    data = request.get_json()  # Get the JSON data from the request 
    # should have violations and the accountId in the data 
    if not data or 'accountId' not in data: 
        return jsonify({"error": "Missing required fields"}), 400 
    
    accountId = data['accountId'] 
    #violations = data.get('violations', [])  # Get the violations if they exist, else default to an empty list 
    data = data.get('data', {})  # Get the data field if it exists, else default to an empty dictionary
    violations = data.get('violations', [])  # Get the violations if they exist, else default to an empty list 

    success = PostBoundary.handleDeletePost(post_id, violations=violations)  # Use the boundary to handle the deletion of the post by its ID 

    if success: 
        return jsonify({"message": f"Post with ID {post_id} deleted successfully! with account {accountId} and violations {violations}"}), 200 
    else:
        return jsonify({"error": f"Failed to delete post with ID {post_id}"}), 500 

@app.route('/posts', methods=['GET']) 
def get_all_posts():
    """
    Retrieve all posts from the database.
    """
    
    # posts = PostControl.retrieveAllPosts()
    posts = PostBoundary.handleRetrieveAllPosts()  # Use the boundary to handle the retrieval of all posts 
    allPosts = [] 
    if posts:
        
        for post in posts: 
            allPosts.append(post.toDict())  # Convert each post entity to a dictionary for JSON serialization
    return jsonify(allPosts), 200  # Return the list of posts as JSON
    
@app.route('/createPost', methods=['POST']) 
def createPost():

    """
    Create a new post in the database.
    """
    try: 
        data = request.get_json()  # Get the JSON data from the request 
        if not data or 'accountId' not in data or 'postData' not in data: 
            return jsonify({"error": "Missing required fields"}), 400 
        accountId = data['accountId'] 
        postData = data['postData'] 
        print (f"in app.py: accountId: {accountId}, postData: {postData}")
        
        
        post, success = PostBoundary.createPost(accountId, postData)  # Use the boundary to create the post 
        
        if success:
            # return jsonify({"message": "Post created successfully!"}), 201
            return jsonify(post.toDict()), 201 
        else:
            return jsonify({"error": "Failed to create post"}), 500
    except Exception as e:
        print(f"Error creating post: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route('/labels', methods=['GET'])
def getAllLabels():
    """
    Retrieve all labels from the database.
    """
    try:
        labels = LabelBoundary.handleRetrieveAllLabels()  # Use the boundary to handle the retrieval of all labels
        if labels:
            return jsonify([label.toDict() for label in labels]), 200  # Convert each label to a dictionary
        else:
            return jsonify({"error": "No labels found"}), 404
    except Exception as e:
        print(f"Error retrieving labels: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500 
    

@app.route('/violations', methods=['GET'])
def violations():
    """
    Endpoint to check for violations.
    """
    try:
        violations = ViolationBoundary.handleRetrieveAllViolations()  # Use the boundary to handle the retrieval of all violations 
        if violations:
            return jsonify([violation.toDict() for violation in violations]), 200  # Convert each violation to a dictionary
        else:
            return jsonify({"message": "No violations found"}), 404 

    except Exception as e:
        print(f"Error checking violations: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route('/toggleLikes/<int:post_id>/<int:account_id>', methods=['POST'] )
def toggleLikes(post_id, account_id):
    """
    Toggle the like status of a post for a given account.
    """
    try:
        result = PostBoundary.handleToggleLikes(post_id, account_id)  # Use the boundary to handle toggling likes 
        return jsonify(result), 200  # Return the result as JSON
    except Exception as e:
        print(f"Error toggling likes: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500 
    

if __name__  == "__main__":


    host  = os.environ.get("FLASK_RUN_HOST")
    port  = int(os.environ.get("FLASK_RUN_PORT"))
    debug = os.environ.get("FLASK_DEBUG").lower() in ("1", "true", "yes")

    app.run(host=host, port=port, debug=debug)