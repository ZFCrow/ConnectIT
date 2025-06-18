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
        


    @staticmethod 
    def deleteComment(commentId: int) -> bool:
        """
        Delete a comment by its ID.
        But it will not delete the comment, just mark it as deleted.
        """

        with db_context.session_scope() as session:
            comment_model = session.query(CommentModel).filter(CommentModel.commentId == commentId).first()
            if comment_model:
                comment_model.isDeleted = True
                session.commit()
                return True
            else:
                return False 