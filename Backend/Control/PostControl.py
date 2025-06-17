from Boundary.Mapper.PostMapper import PostMapper 
from Entity.Post import Post 
from SQLModels.PostModel import PostModel as Postmodel 
from Boundary.TableDataGateway.LabelGateway import LabelGateway
from Boundary.TableDataGateway.ViolationGateway import ViolationGateway 

class PostControl: 
    def __init__(self):
        pass 
     
    
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
    

    @staticmethod 
    def createPost(postData : dict) -> tuple[Post, bool]:
        """
        Create a new post in the database.
        """
        # should retrieve the labels from the postData and get them from the label gateway ?
        labels : str = postData.get('labels', []) # should be a list of label IDs
        listofLabels = LabelGateway.getLabelsbyIds(labels)  # 
        post = Post.fromDict(postData, labels=listofLabels)  # Create Post entity from dictionary and labels 
        success = PostMapper.createPost(post) 
        return post, success  # Return the created post and success status 
    

    @staticmethod 
    def deletePost(postId: int, violations: list[int]) -> bool:
        """
        Delete a post by its ID.
        """
        violations = ViolationGateway.getViolationsByIds(violations)  # Retrieve violations by their IDs 
        success = PostMapper.deletePost(postId=postId, violations=violations)  # Call the mapper to delete the post
        return success  # Return the success status of the deletion 

