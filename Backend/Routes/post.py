from flask import Blueprint, request, jsonify, abort
from Control.PostControl import PostControl
import traceback
from Security.ValidateInputs import validate_post
from Security.Limiter import limiter, get_account_key
from Security.JWTUtils import JWTUtils

post_bp = Blueprint("post", __name__)


def _authenticate():
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401, description="Authentication required")
    try:
        claims = JWTUtils.decode_jwt_token(token)
    except Exception:
        abort(401, description="Invalid or expired token")
    return claims


@post_bp.route("/createPost", methods=["POST"])
@limiter.limit("10 per hour", key_func=get_account_key)
def createPost():
    """
    Create a new post in the database.
    """
    claims = _authenticate()
    user_id = claims.get("sub")

    try:
        data = request.get_json()
        if not data or "postData" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        postData = data["postData"]
        # 401 if they try to forge someone else's accountId
        if postData.get("accountId") is not None and postData["accountId"] != user_id:
            abort(401, description="Unauthorized: accountId does not match token")
        postData["accountId"] = user_id

        errors = validate_post(postData)
        if errors:
            return jsonify({"error": errors}), 400

        post, success = PostControl.createPost(postData)
        if success:
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
    Delete a post by its ID; only the owner, Company, or Admin may delete.
    """
    claims = _authenticate()
    user_id = claims.get("sub")
    role = claims.get("role")

    try:
        # verify post exists
        post_entity = PostControl.retrievePostById(post_id)
        if not post_entity:
            return jsonify({"error": "Post not found"}), 404

        # verify ownership or elevated role
        if post_entity.accountId != user_id and role not in ("Admin", "Company"):
            abort(403, description="Forbidden: cannot delete this post")

        data = request.get_json() or {}
        violations = data.get("data", {}).get("violations", [])

        success = PostControl.deletePost(post_id, violations=violations)
        if success:
            return jsonify({"message": f"Post {post_id} deleted successfully"}), 200
        else:
            return jsonify({"error": f"Failed to delete post {post_id}"}), 500

    except Exception as e:
        print(f"Error deleting post: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



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
    claims = _authenticate()
    if claims.get("sub") != account_id:
        abort(403, description="Cannot like on behalf of another user")
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
