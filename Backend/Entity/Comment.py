from dataclasses import dataclass
from datetime import datetime
import pytz
from SQLModels.CommentModel import CommentModel


@dataclass
class Comment:
    commentId: int
    content: str
    createdAt: datetime
    accountId: int
    postId: int
    isDeleted: bool = False
    # Additional fields for account information
    # (not creating a separate Account entity)
    accountUsername: str = None
    accountDisplayPicture: str = None

    @staticmethod
    def getSingaporeTimezone() -> pytz.timezone:
        """Get Singapore timezone"""
        return datetime.now(
            pytz.timezone('Asia/Singapore')
            ).replace(tzinfo=None)

    @classmethod
    def from_CommentModel(cls, comment_model) -> 'Comment':
        """Create Comment entity from CommentModel instance"""
        # createdAt = cls._parse_datetime(comment_model.createdAt)
        return cls(
            commentId=comment_model.commentId,
            content=comment_model.content,
            createdAt=comment_model.createdAt,
            accountId=comment_model.accountId,
            postId=comment_model.postId,
            isDeleted=bool(comment_model.isDeleted),
            accountUsername=(
                comment_model.account.name
                if comment_model.account
                else None
                ),
            accountDisplayPicture=(
                comment_model.account.profilePicUrl
                if comment_model.account else None
            )
        )

    def toCommentModel(self) -> 'CommentModel':
        """Convert Comment entity to CommentModel for database operations"""
        return CommentModel(
            # commentId=self.commentId,
            content=self.content,
            createdAt=self.createdAt,
            accountId=self.accountId,
            postId=self.postId,
            # Convert bool to int for database storage
            isDeleted=int(self.isDeleted)
        )

    def toDict(self) -> dict:
        """Convert Comment entity to dictionary for JSON serialization"""
        return {
            'commentId': self.commentId,
            'content': self.content,
            'createdAt': (
                self.createdAt.isoformat()
                if isinstance(self.createdAt, datetime)
                else self.createdAt
                ),
            'accountId': self.accountId,
            'postId': self.postId,
            'isDeleted': self.isDeleted,
            'username': self.accountUsername,
            'displayPicUrl': self.accountDisplayPicture
        }

    # @staticmethod
    # def nowSG() -> pytz.timezone:
    #     """Get Singapore timezone"""
    #     print (f"Getting current time in Singapore timezone: {SINGAPORE_TZ}")
    #     return datetime.now(SINGAPORE_TZ)

    @classmethod
    def fromDict(cls, data: dict) -> 'Comment':
        """Create Comment entity from dictionary"""
        return cls(
            commentId=data.get('commentId', 0),
            content=data.get('content', ''),
            # Default to current Singapore time if not provided
            createdAt=cls.getSingaporeTimezone(),
            accountId=data.get('accountId', 0),
            postId=data.get('postId', 0),
            isDeleted=data.get('isDeleted', False),
            accountUsername=data.get('accountUsername', None),
            accountDisplayPicture=data.get('accountDisplayPicture', None)
        )
