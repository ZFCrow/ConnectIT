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
        comment = Comment.fromDict(commentData)  # Create Comment entity from dictionary
        return CommentMapper.createComment(comment)  # Call the mapper to create the comment and return the created comment entity 