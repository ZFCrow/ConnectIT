from dataclasses import dataclass, field
from datetime import datetime
import pytz
from SQLModels.CommentModel import CommentModel

@dataclass
class Comment:
    # Private, name-mangled fields
    __commentId:           int
    __content:             str
    __createdAt:           datetime
    __accountId:           int
    __postId:              int
    __isDeleted:           bool     = False
    __accountUsername:     str      = field(default=None)
    __accountDisplayPicture:str     = field(default=None)

    # ------------------------
    # Public, read-only properties
    # ------------------------
    @property
    def commentId(self) -> int:
        return self.__commentId

    @property
    def content(self) -> str:
        return self.__content

    @property
    def createdAt(self) -> datetime:
        return self.__createdAt

    @property
    def accountId(self) -> int:
        return self.__accountId

    @property
    def postId(self) -> int:
        return self.__postId

    @property
    def isDeleted(self) -> bool:
        return self.__isDeleted

    @property
    def accountUsername(self) -> str:
        return self.__accountUsername

    @property
    def accountDisplayPicture(self) -> str:
        return self.__accountDisplayPicture

    # ------------------------
    # Methods that mutate “private” state
    # ------------------------
    def mark_deleted(self) -> None:
        """Soft-delete this comment."""
        self.__isDeleted = True

    def update_content(self, new_content: str) -> None:
        """Change the comment’s text."""
        self.__content = new_content

    # ------------------------
    # Timezone helper
    # ------------------------
    @staticmethod
    def getSingaporeTimezone() -> datetime:
        """Get current Singapore time (naive datetime)."""
        return datetime.now(pytz.timezone("Asia/Singapore")).replace(tzinfo=None)

    # ------------------------
    # Converters
    # ------------------------
    @classmethod
    def from_CommentModel(cls, m: CommentModel) -> "Comment":
        return cls(
            m.commentId,
            m.content,
            m.createdAt,
            m.accountId,
            m.postId,
            bool(m.isDeleted),
            m.account.name if m.account else None,
            m.account.profilePicUrl if m.account else None,
        )

    def toCommentModel(self) -> CommentModel:
        return CommentModel(
            content=self.__content,
            createdAt=self.__createdAt,
            accountId=self.__accountId,
            postId=self.__postId,
            isDeleted=int(self.__isDeleted),
        )

    def toDict(self) -> dict:
        return {
            "commentId": self.__commentId,
            "content":   self.__content,
            "createdAt": self.__createdAt.isoformat(),
            "accountId": self.__accountId,
            "postId":    self.__postId,
            "isDeleted": self.__isDeleted,
            "username":  self.__accountUsername,
            "displayPicUrl": self.__accountDisplayPicture,
        }

    @classmethod
    def fromDict(cls, data: dict) -> "Comment":
        return cls(
            data.get("commentId", 0),
            data.get("content", ""),
            cls.getSingaporeTimezone(),
            data.get("accountId", 0),
            data.get("postId", 0),
            data.get("isDeleted", False),
            data.get("accountUsername", None),
            data.get("accountDisplayPicture", None),
        )
