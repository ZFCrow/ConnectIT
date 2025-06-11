from SQLModels.base import db_context
from SQLModels.PostModel import PostModel 
class PostMapper: 
    def __init__(self):
        pass 

    @staticmethod 
    def getPostById(postId) -> dict: 
        """
        Fetch a post by its ID. 
        """
        with db_context() as session:
            post = session.query(PostModel).filter(PostModel.postID == postId).first()
            if post:
                return {
                    "postID": post.postID,
                    "title": post.title,
                    "content": post.content,
                    "date": post.date.isoformat(),
                    "accountID": post.accountID
                }
            else:
                return None 



