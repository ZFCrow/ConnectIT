from Control.PostControl import PostControl 
from Entity.Post import Post 
class PostBoundary: 
    def __init__(self):
        pass 
    
    @staticmethod
    def createPost(accountId: int , postData: dict) -> bool:
        """
        Handle the creation of a new post.
        """

        postData['accountId'] = accountId 
        print (f" Post boundary: Creating post with data: {postData} for account ID: {postData['accountId']}")
        results = PostControl.createPost(postData) 
        print (f"Post boundary: Post creation result: {results}") 
        return results 
    @staticmethod 
    def handleRetrieveAllPosts() -> list[Post]: 
        """
        Handle the retrieval of all posts.
        """
        return PostControl.retrieveAllPosts() 
    