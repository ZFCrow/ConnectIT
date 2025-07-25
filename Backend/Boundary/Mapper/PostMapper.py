from SQLModels.base import db_context
from SQLModels.PostModel import PostModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import joinedload
from sqlalchemy import select, func
from SQLModels.AccountModel import AccountModel
from SQLModels.CommentModel import CommentModel
from SQLModels.PostLabelModel import PostLabelModel
from SQLModels.LabelModel import LabelModel
from SQLModels.PostViolationModel import PostViolationModel
from SQLModels.PostLikesModel import PostLikesModel
from Entity.Post import Post
from Entity.Label import Label
from Entity.Violation import Violation
from math import ceil


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
            post = (
                session.query(PostModel)
                .options(
                    # Load the associated account
                    joinedload(PostModel.account),
                    joinedload(
                        PostModel.postLabels
                        # Load associated labels
                    ).joinedload(PostLabelModel.label),
                    joinedload(
                        PostModel.comments
                        # Load associated comments and their accounts
                    ).joinedload(CommentModel.account),
                    # Load associated likes
                    joinedload(PostModel.postLikes),
                )
                .filter(PostModel.postId == postId, PostModel.isDeleted == 0)
                .first()
            )  # Only fetch non-deleted posts
            if post:
                # find the labels , find the correct label entity ,
                labelsModels = [pl.label for pl in post.postLabels]
                # convert to label entities
                labels = [Label.fromLabelModel(lm) for lm in labelsModels]
                # create the post entity and pass the labels
                postEntity = Post.from_PostModel(post, labels)

                return postEntity  # Return the Post entity
            # Return None if no post found with the given ID
            return None

    @staticmethod
    def getAllPosts() -> list[Post]:
        """
        Fetch all posts from the database.
        fetch from post , commetn and postlabel tables
        """
        with db_context.session_scope() as session:
            posts = (
                session.query(PostModel)
                .options(
                    joinedload(PostModel.account),  # Load the associated account
                    joinedload(
                        PostModel.postLabels
                        # Load associated labels
                    ).joinedload(PostLabelModel.label),
                    joinedload(
                        PostModel.comments
                        # Load associated comments and their accounts
                    ).joinedload(CommentModel.account),
                    joinedload(PostModel.postLikes),  # Load associated likes
                )
                .filter(PostModel.isDeleted == 0)
                .all()
            )  # Only fetch non-deleted posts
            # now i need to retrieve all the label entity for
            # each post and put it in each post
            listofPostEntities = []
            if posts:
                for post in posts:
                    for postLikesModel in post.postLikes:
                        # get the account from the postLikesModel
                        print(f"Post liked by : {postLikesModel.accountId}")
                    # find the labels , find the correct label entity,
                    # # these are the label models
                    labelsModels = [pl.label for pl in post.postLabels]
                    # convert to label entities
                    labels = [Label.fromLabelModel(lm) for lm in labelsModels]

                    # find the comments, then create the
                    # comment entities from post entity
                    # commentModels = [cm for cm in post.comments]
                    # create the post entity and pass the labels
                    postEntity = Post.from_PostModel(post, labels)
                    # add the comments to the post entity
                    # postEntity.populateComments(commentModels)
                    listofPostEntities.append(postEntity)
            return listofPostEntities

    @staticmethod
    def getPosts(
        page: int = 1,
        pageSize: int = 10,
        filterLabel: Optional[str] = None,
        sortBy: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Fetch posts with pagination, optional label filtering, and sorting.
        Returns a dictionary with posts and pagination info.
        """
        with db_context.session_scope() as session:
            query = session.query(PostModel).filter(PostModel.isDeleted == 0)

            # check if theres filterLabel
            if filterLabel:
                query = query.filter(
                    PostModel.postLabels.any(
                        PostLabelModel.label.has(LabelModel.description == filterLabel)
                    )
                )
            commentCount = (
                select(func.count(CommentModel.commentId))
                .where(
                    CommentModel.postId == PostModel.postId, CommentModel.isDeleted == 0
                )
                .scalar_subquery()
            )
            # check if theres sortBy
            if sortBy:
                if sortBy == "Most liked":
                    query = query.order_by(PostModel.postLikes.count().desc())
                elif sortBy == "Most Commented":
                    query = query.order_by(commentCount.desc())
                elif sortBy == "Most Recent":
                    query = query.order_by(PostModel.date.desc())

            totalCount = query.count()  # Get total count of posts
            totalPages = ceil(totalCount / pageSize)  # Calculate total pages
            postModels = (
                query.options(
                    # Load the associated account
                    joinedload(PostModel.account),
                    # Load associated labels
                    joinedload(PostModel.postLabels).joinedload(PostLabelModel.label),
                    # Load associated comments and their accounts
                    joinedload(PostModel.comments).joinedload(CommentModel.account),
                    joinedload(PostModel.postLikes),  # Load associated likes
                )
                .offset((page - 1) * pageSize)  # Apply pagination offset
                .limit(pageSize)  # Limit the number of posts per page
            ).all()  # Fetch the posts for the current page
            # Map to domain entities
            posts = []
            for pm in postModels:
                # find the labels , find the correct label entity ,
                labelsModels = [pl.label for pl in pm.postLabels]
                # convert to label entities
                labels = [Label.fromLabelModel(lm) for lm in labelsModels]
                # find the comments, then create the
                # comment entities from post entity
                # commentModels = [cm for cm in pm.comments]
                # create the post entity and pass the labels
                postEntity = Post.from_PostModel(pm, labels)
                # add the comments to the post entity
                # postEntity.populateComments(commentModels)
                posts.append(postEntity.toDict())
            return {
                "posts": posts,  # List of Post entities
                "totalCount": totalCount,  # Total number of posts
                "totalPages": totalPages,  # Total number of pages
                "currentPage": page,  # Current page numbe
                "pageSize": pageSize,  # Number of posts per page
            }

    @staticmethod
    def createPost(post: Post) -> bool:
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
                    isDeleted=post.isDeleted,
                )
                session.add(postModel)
                # FLUSH : send INSERT to db, gets the
                # auto-incremented ID
                session.flush()
                # After flushing, postModel.postId will have
                # the auto-incremented ID
                for label in post.associated_labels:
                    # Create a PostLabelModel for each label
                    # associated with the post
                    postLabelModel = PostLabelModel(
                        # Use the auto-incremented ID after flush
                        postId=postModel.postId,
                        # Assuming labelID is the ID of the label entity
                        labelId=label.labelId,
                    )
                    session.add(postLabelModel)

                # load the account to get username
                account = (
                    session.query(AccountModel)
                    .filter(AccountModel.accountId == post.accountId)
                    .first()
                )
                print(f"Post created with ID: {postModel.postId}")
                # Update the post ID with the auto-incremented
                # ID from the database
                # post.post_id = postModel.postId
                # post.accountUsername = account.name if account else None
                post.setAccountInfo(
                    username=account.name if account else None,
                    display_pic_url=account.profilePicUrl if account else None,
                )
                post.setId(postModel.postId)

                return True  # Return True to indicate success
        except Exception as e:
            print(f"Error creating post: {e}")
            return False

    @staticmethod
    def deletePost(postId: int, violations: list[Violation]) -> bool:
        """
        we will update the isDeleted field to True
        instead of deleting the post from the database.
        This allows us to keep the post in the database
        for historical purposes while marking it as deleted.
        violations is a list of violations ranging from
        none to multiple violations. create them in postviolation
        table if it exists.
        """
        print(f"Deleting post with ID {postId}...")
        try:
            with db_context.session_scope() as session:
                post = (
                    session.query(PostModel).filter(PostModel.postId == postId).first()
                )
                if post:
                    print(f"Found post with ID {postId}.")
                    post.isDeleted = True  # Mark the post as deleted

                    print(f"Post with ID {postId} marked as deleted.")
                    # If there are violations,
                    # create entries in the PostViolation table

                    if violations:
                        for violation in violations:
                            # Assuming PostViolationModel exists
                            # and has postId and violationId fields
                            postViolationModel = PostViolationModel(
                                postId=postId, violationId=violation.violationId
                            )
                            session.add(postViolationModel)

                    return True
                else:
                    print(f"Post with ID {postId} not found.")
                    return False
        except Exception as e:
            print(f"Error deleting post with ID {postId}: {e}")

            return False

    @staticmethod
    def createDeletePostLikes(postId: int, accountId: int) -> dict[bool, str]:
        """
        Create a like for a post by an account.
        """
        try:
            with db_context.session_scope() as session:
                # Check if the like already exists
                existing_like = (
                    session.query(PostLikesModel)
                    .filter(
                        PostLikesModel.postId == postId,
                        PostLikesModel.accountId == accountId,
                    )
                    .first()
                )
                # we remove the like if it exists,
                # otherwise we create a new like
                if existing_like:
                    session.delete(existing_like)
                    print(
                        f"Like removed for post ID {postId} \
                          by account ID {accountId}."
                    )
                    return {
                        "success": True,
                        "message": f"Like removed for post ID {postId} \
                            by account ID {accountId}.",
                    }
                else:
                    # Create a new like
                    new_like = PostLikesModel(postId=postId, accountId=accountId)
                    session.add(new_like)
                    print(
                        f"Like added for post ID {postId} \
                          by account ID {accountId}."
                    )

                    return {
                        "success": True,
                        "message": f"Like added for post ID \
                            {postId} by account ID {accountId}.",
                    }
        except Exception as e:
            print(
                f"Error toggling like for post ID {postId} \
                  by account ID {accountId}: {e}"
            )
            return {
                "success": False,
                "message": f"Error toggling like for post ID \
                    {postId} by account ID {accountId}: {e}",
            }

    @staticmethod
    def getRecentlyInteractedPosts(accountId: int, limit: int = 5) -> list[Post]:
        """
        Fetch the most recent posts interacted by the account.
        """
        with db_context.session_scope() as session:
            posts = (
                session.query(PostModel)
                .options(
                    joinedload(PostModel.account),  # Load the associated account
                    # Load associated labels
                    joinedload(PostModel.postLabels).joinedload(PostLabelModel.label),
                    # Load associated comments and their accounts
                    joinedload(PostModel.comments).joinedload(CommentModel.account),
                    joinedload(PostModel.postLikes),  # Load associated likes
                )
                .filter(
                    (
                        (PostModel.postLikes.any(PostLikesModel.accountId == accountId))
                        | (PostModel.comments.any(CommentModel.accountId == accountId))
                    )
                    & (PostModel.isDeleted == 0)  # Only fetch non-deleted posts
                )
                .order_by(PostModel.date.desc())
                .limit(limit)
                .all()
            )

            labelModels = [pl.label for post in posts for pl in post.postLabels]
            labels = [Label.fromLabelModel(lm) for lm in labelModels]

            return (
                [Post.from_PostModel(post, labels=labels) for post in posts]
                if posts
                else []
            )
