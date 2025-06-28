from Entity.Comment import Comment
from Boundary.Mapper.CommentMapper import CommentMapper


class CommentControl:
    def __init__(self):
        pass

    @staticmethod
    def createComment(commentData: dict) -> Comment:
        """
        Create a new comment in the database.
        """
        # Create Comment entity from dictionary
        comment = Comment.fromDict(commentData)
        # Call the mapper to create the comment
        # and return the created comment entity
        return CommentMapper.createComment(comment)

    @staticmethod
    def deleteComment(commentId: int) -> bool:
        """
        Delete a comment by its ID.
        This will not delete the comment, just mark it as deleted.
        """
        print(f"Comment control: Deleting comment with ID {commentId}.")
        return CommentMapper.deleteComment(commentId)
