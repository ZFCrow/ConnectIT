from flask import Blueprint, request, jsonify
from Control.PostControl import PostControl
import traceback
from Security.ValidateInputs import validate_post
from Security.Limiter import limiter, get_account_key


post_bp = Blueprint("post", __name__)


@post_bp.route("/createPost", methods=["POST"])
@limiter.limit("10 per hour", key_func=get_account_key)
def createPost():
    """
    Create a new post in the database.
    """
    try:
        data = request.get_json()  # Get the JSON data from the request
        if not data or "accountId" not in data or "postData" not in data:
            return jsonify({"error": "Missing required fields"}), 400
        accountId = data["accountId"]
        postData = data["postData"]
        print(f"in app.py: accountId: {accountId}, postData: {postData}")

        postData["accountId"] = accountId

        errors = validate_post(postData)
        if errors:
            return jsonify({"error": errors}), 400

        postData["accountId"] = accountId
        post, success = PostControl.createPost(
            postData
        )  # Use the control layer to create the post

        if success:
            # return jsonify({"message": "Post created successfully!"}), 201
            return jsonify(post.toDict()), 201
        else:
            return jsonify({"error": "Failed to create post"}), 500
    except Exception as e:
        print(f"Error creating post: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@post_bp.route("/post/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    """
    Delete a post by its ID.
    """
    data = request.get_json()  # Get the JSON data from the request
    # should have violations and the accountId in the data
    if not data or "accountId" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    accountId = data["accountId"]

    data = data.get(
        "data", {}
    )  # Get the data field if it exists, else default to an empty dictionary
    violations = data.get(
        "violations", []
    )  # Get the violations if they exist, else default to an empty list

    success = PostControl.deletePost(
        post_id, violations=violations
    )  # Use the control layer to delete the post by its ID
    if success:
        return (
            jsonify(
                {
                    "message": f"Post with ID \
                        {post_id} deleted successfully! \
                            with account {accountId} and \
                                violations {violations}"
                }
            ),
            200,
        )
    else:
        return jsonify({"error": f"Failed to delete post with ID {post_id}"}), 500


@post_bp.route("/posts/paginated", methods=["GET"])
def get_paginated_posts():
    """
    Retrieve paginated posts from the database.
    """
    try:
        page = request.args.get("page", default=1, type=int)
        pageSize = request.args.get("pageSize", default=10, type=int)
        print(
            f"Page: {page}, Page Size: {pageSize}"
        )  # Debugging output to check pagination parameters
        filterLabel = request.args.get("filterLabel", default=None, type=str)
        sortBy = request.args.get("sortBy", default=None, type=str)

        results = PostControl.retrievePaginatedPosts(
            page=page, pageSize=pageSize, sortBy=sortBy, filterLabel=filterLabel
        )  # Use the control layer to retrieve paginated posts

        return jsonify(results), 200  # Return the paginated results as JSON
    except Exception as e:
        print(f"Error retrieving paginated posts: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@post_bp.route("/post/<int:post_id>", methods=["GET"])
def get_post_by_id(post_id):
    """
    Retrieve a post by its ID.
    """
    try:

        post = PostControl.retrievePostById(
            post_id
        )  # Use the control layer to retrieve the post by its ID

        if post:
            # Convert the post to a dictionary and return it as JSON
            return jsonify(post.toDict()), 200
        else:
            return jsonify({"error": "Post not found"}), 404
    except Exception as e:
        print(f"Error retrieving post by ID: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@post_bp.route("/toggleLikes/<int:post_id>/<int:account_id>", methods=["POST"])
def toggleLikes(post_id, account_id):
    """
    Toggle the like status of a post for a given account.
    """
    try:

        result = PostControl.toggleLikes(
            post_id, account_id
        )  # Use the control layer to toggle likes for the post

        return jsonify(result), 200  # Return the result as JSON
    except Exception as e:
        print(f"Error toggling likes: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@post_bp.route("/RecentlyInteractedPosts/<int:account_id>", methods=["GET"])
def get_recently_interacted_posts(account_id):
    """
    Retrieve posts that the user has recently interacted with.
    """
    try:

        posts = PostControl.retrieveRecentlyInteractedPosts(
            account_id
        )  # Use the control layer to retrieve recently interacted posts
        return (
            jsonify([post.toDict() for post in posts]),
            200,
        )  # Convert each post to a dictionary

    except Exception as e:
        print(f"Error retrieving recently interacted posts: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
