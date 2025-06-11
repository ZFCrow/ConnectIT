from SQLModels.base import db_context
from SQLModels.PostModel import PostModel
from Entity.Post import Post  
from typing import Optional 
class PostMapper: 
    def __init__(self):
        pass 

    @staticmethod 
    def getPostById(postId) -> Optional[Post]:
        """
        Fetch a post by its ID. 
        """
        with db_context.session_scope() as session:
            post = session.query(PostModel).filter(PostModel.postID == postId).first()
            if post:
                return Post.from_PostModel(post) 
            else:
                return None 



