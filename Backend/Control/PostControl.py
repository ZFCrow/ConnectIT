from Boundary.Mapper.PostMapper import PostMapper
from Entity.Post import Post
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
    def retrievePaginatedPosts(
        page: int,
        pageSize: int,
        sortBy: str = 'createdAt',
        filterLabel: str = None
    ) -> dict[str, any]:
        """
        Retrieve paginated posts from the database.
        """
        results = PostMapper.getPosts(
            page=page,
            pageSize=pageSize,
            filterLabel=filterLabel,
            sortBy=sortBy
        )
        return results

    @staticmethod
    def retrievePostById(postId: int) -> Post:
        """
        Retrieve a post by its ID.
        """
        post = PostMapper.getPostById(postId=postId)
        return post

    @staticmethod
    def retrieveRecentlyInteractedPosts(accountId: int) -> list[Post]:
        """
        Retrieve posts that the user has recently interacted with.
        This could be based on likes, comments, or other interactions.
        """
        # Placeholder for actual implementation
        # Retrieve posts based on recent interactions of the user
        return PostMapper.getRecentlyInteractedPosts(accountId=accountId)

    @staticmethod
    def createPost(postData: dict) -> tuple[Post, bool]:
        """
        Create a new post in the database.
        """
        # should retrieve the labels
        # from the postData and get them from the label gateway ?
        # should be a list of label IDs
        labels: str = postData.get('labels', [])
        listofLabels = LabelGateway.getLabelsbyIds(labels)
        # Create Post entity from dictionary and labels
        post = Post.fromDict(postData, labels=listofLabels)
        success = PostMapper.createPost(post)
        return post, success  # Return the created post and success status

    @staticmethod
    def deletePost(postId: int, violations: list[int]) -> bool:
        """
        Delete a post by its ID.
        """
        # Retrieve violations by their IDs
        violations = ViolationGateway.getViolationsByIds(violations)
        # Call the mapper to delete the post
        success = PostMapper.deletePost(postId=postId, violations=violations)
        return success  # Return the success status of the deletion

    @staticmethod
    def toggleLikes(postId: int, accountId: int) -> dict[bool, str]:
        """
        Toggle the like status of a post for a given account.
        """
        msg = PostMapper.createDeletePostLikes(
            postId=postId, accountId=accountId
            )
        return msg  # Return the success status of the like toggle operation
