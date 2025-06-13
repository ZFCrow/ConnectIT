from Boundary.Mapper.PostMapper import PostMapper 
from Entity.Post import Post 
from SQLModels.PostModel import PostModel as Postmodel 
class PostControl: 
    def __init__(self):
        pass 

    @staticmethod 
    def createPost(accountId: int, postData: dict) -> bool:
        """
        Create a new post in the database.
        """
        post = Post.from_dict(postData)
        post.account_id = accountId  # Set the account ID for the post
        return PostMapper.createPost(post)  # Assuming createPost method exists in PostMapper    
    
    
    @staticmethod 
    def retrieveAllPosts() -> list[Post]:
        """
        Retrieve all posts from the database.
        fetches all post models, for each one , query the 
        corresponding label then create the domain object 
        and return a list of Post entities. 
        """
        # return PostMapper.getAllPosts() 
        posts = PostMapper.getAllPosts() 

        return posts 

