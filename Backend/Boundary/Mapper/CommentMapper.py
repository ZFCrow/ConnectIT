from sqlalchemy.orm import joinedload
from SQLModels.base import db_context 
from SQLModels.CommentModel import CommentModel
from Entity.Comment import Comment 


class CommentMapper: 
    """
    Mapper class for Comment objects. 
    """

    @staticmethod 
    def createComment(comment: Comment) -> Comment:
        """
        Create a new comment in the database.
        """
        with db_context.session_scope() as session:
            comment_model = CommentModel(
                content=comment.content,
                accountId=comment.accountId,
                postId=comment.postId,
                isDeleted=comment.isDeleted
            )
            session.add(comment_model)
            session.commit()
            return Comment.from_CommentModel(comment_model)  # Return the created Comment entity