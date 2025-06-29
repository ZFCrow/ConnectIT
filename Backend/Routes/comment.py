
from flask import Blueprint, request, jsonify
from Control.CommentControl import CommentControl
import traceback
from Security.ValidateInputs import validate_comment
from Security.Limiter import limiter, get_account_key


comment_bp = Blueprint("comment", __name__)


@comment_bp.route('/comment/<post_id>', methods=['POST'])
@limiter.limit("15 per hour", key_func=get_account_key)
def addComment(post_id):
    """
    Add a comment to a post.
    """
    try:
        # Get the JSON data from the request
        data = request.get_json()
        if not data or 'accountId' not in data or 'comment' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        accountId = data['accountId']
        comment = data['comment']  # Get the comment text from the request
        comment['accountId'] = accountId  # Add accountId to the comment data
        comment['postId'] = post_id  # Add the postId to the comment data

        errors = validate_comment(comment)
        if errors:
            return jsonify({"error": errors}), 400

        commentEntity = CommentControl.createComment(comment)
        if commentEntity:
            return jsonify(commentEntity.toDict()), 201
        else:
            return jsonify({"error": "Failed to add comment"}), 500
    except Exception as e:
        print(f"Error adding comment: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@comment_bp.route('/deleteComment/<comment_id>', methods=['POST'])
def deleteComment(comment_id):
    """
    Delete a comment by its ID.
    """
    try:
        data = request.get_json()  # Get the JSON data from the request
        if not data or 'accountId' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        success = CommentControl.deleteComment(comment_id) 
        if success:
            return jsonify(
                {"message": f"Comment with ID {comment_id} \
                 deleted successfully!"}
                ), 200
        else:
            return jsonify(
                {"error": f"Failed to delete comment with ID {comment_id}"}
                ), 500
    except Exception as e:
        print(f"Error deleting comment: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
