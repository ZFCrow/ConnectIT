from Control.CommentControl import CommentControl 
from Entity.Comment import Comment  # Import the Comment entity for type hinting

class CommentBoundary:
    def __init__(self): 
        pass 

    @staticmethod
    def handleCreateComment(commentData: dict) -> Comment:
        """
        Handle the creation of a new comment.
        """
        print("Comment boundary: Creating a new comment.")
        comment = CommentControl.createComment(commentData)  # Call the control layer to create the comment
        print(f"Comment boundary: Created comment with ID {comment.commentId}.")
        return comment  # Return the created comment entity 