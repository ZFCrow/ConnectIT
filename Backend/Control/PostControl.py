from Boundary.Mapper.PostMapper import PostMapper 
from Entity.Post import Post 
from SQLModels.PostModel import PostModel as Postmodel 
from Boundary.TableDataGateway.LabelGateway import LabelGateway

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
    def createPost(postData : dict) -> bool: 
        """
        Create a new post in the database.
        """
        # should retrieve the labels from the postData and get them from the label gateway ?
        labels : str = postData.get('labels', []) # should be a list of label IDs
        listofLabels = LabelGateway.getLabelsbyIds(labels)  # 
        post = Post.fromDict(postData, labels=listofLabels)  # Create Post entity from dictionary and labels 
        return PostMapper.createPost(post) 

