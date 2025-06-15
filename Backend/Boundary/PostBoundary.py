from Control.PostControl import PostControl 
from Entity.Post import Post 
class PostBoundary: 
    def __init__(self):
        pass 
    
    @staticmethod
    def createPost(accountId: int , postData: dict) -> bool:
        return False 
    
    @staticmethod 
    def handleRetrieveAllPosts() -> list[Post]: 
        """
        Handle the retrieval of all posts.
        """
        return PostControl.retrieveAllPosts() 