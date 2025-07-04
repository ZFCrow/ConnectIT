from flask import Blueprint, request, jsonify, abort
from Control.CommentControl import CommentControl
import traceback
from Security.ValidateInputs import validate_comment
from Security.Limiter import limiter, get_account_key
from Security.JWTUtils import JWTUtils

comment_bp = Blueprint("comment", __name__)


def _authenticate():
    """
    Extract and verify JWT from cookie. Abort with 401 on failure.
    Returns the decoded claims (dict).
    """
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401, description="Authentication required")
    try:
        claims = JWTUtils.decode_jwt_token(token)
    except Exception:
        abort(401, description="Invalid or expired token")
    return claims

@comment_bp.route("/comment/<post_id>", methods=["POST"])
@limiter.limit("15 per hour", key_func=get_account_key)
def addComment(post_id):
    """
    Add a comment to a post.
    """
    claims = _authenticate()
    user_id = claims.get("sub")
    try:
        # Get the JSON data from the request
        data = request.get_json()
        if not data or "accountId" not in data or "comment" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        comment_data = data["comment"]

        if comment_data.get("accountId") and comment_data["accountId"] != user_id:
            abort(403, description="Forbidden: cannot comment as another user")

        # Enforce that accountId matches the token
        comment_data["accountId"] = user_id
        comment_data["postId"] = post_id

        errors = validate_comment(comment_data)
        if errors:
            return jsonify({"error": errors}), 400

        commentEntity = CommentControl.createComment(comment_data)
        if commentEntity:
            return jsonify(commentEntity.toDict()), 201
        else:
            return jsonify({"error": "Failed to add comment"}), 500
    except Exception as e:
        print(f"Error adding comment: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@comment_bp.route("/deleteComment/<comment_id>", methods=["POST"])
def deleteComment(comment_id):
    """
    Delete a comment by its ID.
    """
    claims = _authenticate()
    user_id = claims.get("sub")
    try:
        # Ensure comment exists
        comment_entity = CommentControl.getCommentById(comment_id)
        if not comment_entity:
            return jsonify({"error": "Comment not found"}), 404

        # Verify ownership
        if comment_entity.accountId != user_id:
            return jsonify({"error": "Forbidden: cannot delete others\' comments"}), 403

        success = CommentControl.deleteComment(comment_id)
        if success:
            return jsonify({"message": f"Comment {comment_id} deleted successfully"}), 200
        else:
            return jsonify({"error": f"Failed to delete comment {comment_id}"}), 500

    except Exception as e:
        print(f"Error deleting comment: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
