from Control.PostControl import PostControl
from Entity.Post import Post


class PostBoundary:
    def __init__(self):
        pass

    @staticmethod
    def createPost(accountId: int, postData: dict) -> bool:
        """
        Handle the creation of a new post.
        """

        postData['accountId'] = accountId
        print(f" Post boundary: Creating post with data: \
               {postData} for account ID: {postData['accountId']}")
        results = PostControl.createPost(postData)
        print(f"Post boundary: Post creation result: {results}")
        return results

    @staticmethod
    def handleRetrieveAllPosts() -> list[Post]:
        """
        Handle the retrieval of all posts.
        """
        return PostControl.retrieveAllPosts()

    @staticmethod
    def handleRetrievePostById(postId: int) -> Post:
        """
        Handle the retrieval of a post by its ID.
        """
        print(f"Post boundary: Retrieving post with ID: {postId}")
        # Call the control layer to retrieve the post by its ID
        return PostControl.retrievePostById(postId)

    @staticmethod
    def handleRetrievePaginatedPosts(
        page: int,
        pageSize: int,
        sortBy: str = 'createdAt',
        filterLabel: str = None
    ) -> dict[str, any]:
        """
        Handle the retrieval of paginated posts.
        """
        print(f"Post boundary: Retrieving paginated posts - Page: \
              {page}, Page Size: {pageSize}, Sort By: {sortBy}, \
                Filter Label: {filterLabel}")
        return PostControl.retrievePaginatedPosts(
            page,
            pageSize,
            sortBy,
            filterLabel
            )

    @staticmethod
    def handleRetrieveRecentlyInteractedPosts(accountId: int) -> list[Post]:
        """
        Handle the retrieval of posts that the user has recently
        interacted with.
        """
        print(f"Post boundary: Retrieving recently interacted posts \
              for account ID: {accountId}")
        # Call the control layer to retrieve posts based on
        # recent interactions of the user
        return PostControl.retrieveRecentlyInteractedPosts(accountId)

    @staticmethod
    def handleDeletePost(postId: int, violations: list[int]) -> bool:
        """
        Handle the deletion of a post by its ID.
        """
        print(f"Post boundary: Deleting post with ID: {postId}")
        # Call the control layer to delete the post by its
        # ID and handle violations
        return PostControl.deletePost(postId, violations)

    @staticmethod
    def handleToggleLikes(postId: int, accountId: int) -> dict[bool, str]:
        """
        Handle toggling the like status of a post for a given account.
        """
        print(f"Post boundary: Toggling likes for post ID: \
              {postId} by account ID: {accountId}")
        # Call the control layer to toggle likes for the post
        return PostControl.toggleLikes(postId, accountId)
