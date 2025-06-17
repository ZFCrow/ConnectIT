from SQLModels.base import db_context
from SQLModels.PostModel import PostModel

from typing import Optional 
from sqlalchemy.orm import joinedload 
from SQLModels.AccountModel import AccountModel 
from SQLModels.CommentModel import CommentModel
from SQLModels.PostLabelModel import PostLabelModel 
from Entity.Post import Post  
from Entity.Label import Label 
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
        fetch from post , commetn and postlabel tables
        """
        with db_context.session_scope() as session:
            posts = session.query(PostModel).options(
                joinedload(PostModel.account),  # Load the associated account 
                joinedload(PostModel.postLabels).joinedload(PostLabelModel.label),  # Load associated labels 
                joinedload(PostModel.comments).joinedload(CommentModel.account),  # Load associated comments and their accounts 
                joinedload(PostModel.postLikes)  # Load associated likes 
            ).all()
            #! now i need to retrieve all the label entity for each post and put it in each post
            listofPostEntities = [] 
            if posts: 
                for post in posts: 
                    for postLikesModel in post.postLikes: 
                        # get the account from the postLikesModel 
                        print (f"Post liked by : {postLikesModel.accountId}") 

                    # find the labels , find the correct label entity , 
                    labelsModels = [pl.label for pl in post.postLabels] # these are the label models 
                    labels = [Label.fromLabelModel(lm) for lm in labelsModels]  # convert to label entities 
                    
                    # find the comments, then create the comment entities from post entity
                    commentModels = [cm for cm in post.comments] 
                    # create the post entity and pass the labels 
                    postEntity = Post.from_PostModel(post, labels) 
                    # add the comments to the post entity 
                    postEntity.populateComments(commentModels) 

                    listofPostEntities.append(postEntity) 
            return listofPostEntities 
            # return [Post.from_PostModel(post) for post in posts] if posts else [] 
        
    @staticmethod 
    def createPost(post: Post) -> bool : 
        """
        Create a new post in the database.s
        """ 
        try: 

            with db_context.session_scope() as session:
                postModel = PostModel( 
                    # postID=post.post_id,
                    title=post.title,
                    content=post.content,
                    date=post.date,
                    accountId=post.accountId,
                    isDeleted=post.isDeleted
                ) 
                session.add(postModel)
                # FLUSH : send INSERT to db, gets the auto-incremented ID 
                session.flush()
                # After flushing, postModel.postId will have the auto-incremented ID 
                for label in post.associated_labels: 
                    # Create a PostLabelModel for each label associated with the post
                    postLabelModel = PostLabelModel(
                        postId=postModel.postId,  # Use the auto-incremented ID after flush
                        labelId=label.labelId  # Assuming labelID is the ID of the label entity
                    )
                    session.add(postLabelModel) 


                # load the account to get username 
                account = session.query(AccountModel).filter(AccountModel.accountId == post.accountId).first()

                print (f"Post created with ID: {postModel.postId}") 

                post.post_id = postModel.postId  # Update the post ID with the auto-incremented ID from the database 
                post.accountUsername = account.name if account else None
                
                return True  # Return True to indicate success 
        except Exception as e: 
            print(f"Error creating post: {e}") 
            return False 






