from SQLModels.base import db_context
from SQLModels.PostModel import PostModel
from Entity.Post import Post  
from typing import Optional 
class PostMapper: 
    """
    Mapper class for handling database operations related to Post entities.
    stateless so it can be used without instantiation. 
    """

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
            
    @staticmethod 
    def getAllPosts() -> list[Post]:
        """
        Fetch all posts from the database.
        """
        with db_context.session_scope() as session:
            posts = session.query(PostModel).all()
            return [Post.from_PostModel(post) for post in posts] if posts else [] 
        
    @staticmethod 
    def createPost(post: Post) -> bool : 
        """
        Create a new post in the database.
        """ 
        try: 

            with db_context.session_scope() as session:
                postModel = PostModel( 
                    # postID=post.post_id,
                    title=post.title,
                    content=post.content,
                    date=post.date,
                    accountId=post.account_id,
                    isDeleted=post.is_deleted
                ) 
                session.add(postModel)


                # FLUSH : send INSERT to db, gets the auto-incremented ID 
                session.flush()

                print (f"Post created with ID: {postModel.postID}") 

                post.post_id = postModel.postID  # Update the post ID with the auto-incremented ID from the database 
                return True  # Return True to indicate success 
        except Exception as e: 
            print(f"Error creating post: {e}") 
            return False 






