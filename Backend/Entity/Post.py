from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
import pytz

from Entity.Label import Label
from Entity.Comment import Comment
from Entity.Violation import Violation
from SQLModels.PostModel import PostModel


@dataclass
class Post:
    # ─────────── Private, name-mangled fields ───────────
    __post_id: int
    __title: str
    __content: str
    __date: Union[datetime, str]
    __accountId: int
    __isDeleted: int = 0
    __associated_labels: List[Label] = field(default_factory=list)
    __associated_comments: List[Comment] = field(default_factory=list)
    __associated_violations: List[Violation] = field(default_factory=list)
    __accountUsername: Optional[str] = None
    __accountDisplayPicture: Optional[str] = None
    __likedBy: List[int] = field(default_factory=list)

    # ─────────── Public, read-only properties ───────────
    @property
    def post_id(self) -> int:
        return self.__post_id

    @property
    def title(self) -> str:
        return self.__title

    @property
    def content(self) -> str:
        return self.__content

    @property
    def date(self) -> Union[datetime, str]:
        return self.__date

    @property
    def accountId(self) -> int:
        return self.__accountId

    @property
    def isDeleted(self) -> int:
        return self.__isDeleted

    @property
    def associated_labels(self) -> List[Label]:
        return list(self.__associated_labels)  # return a copy

    @property
    def associated_comments(self) -> List[Comment]:
        return list(self.__associated_comments)

    @property
    def associated_violations(self) -> List[Violation]:
        return list(self.__associated_violations)

    @property
    def accountUsername(self) -> Optional[str]:
        return self.__accountUsername

    @property
    def accountDisplayPicture(self) -> Optional[str]:
        return self.__accountDisplayPicture

    @property
    def likedBy(self) -> List[int]:
        return list(self.__likedBy)

    # ─────────── Internal mutation methods ───────────
    def mark_deleted(self) -> None:
        """Soft-delete this post."""
        self.__isDeleted = 1

    def add_label(self, label: Label) -> None:
        if label not in self.__associated_labels:
            self.__associated_labels.append(label)

    def remove_label(self, label: Label) -> None:
        if label in self.__associated_labels:
            self.__associated_labels.remove(label)

    def add_comment(self, comment: Comment) -> None:
        self.__associated_comments.append(comment)

    def add_violation(self, violation: Violation) -> None:
        self.__associated_violations.append(violation)

    def setAccountInfo(
        self, username: str, display_pic_url: Optional[str] = None
    ) -> None:
        self.__accountUsername = username
        self.__accountDisplayPicture = display_pic_url

    def set_date(self, new_date: Union[datetime, str]) -> None:
        self.__date = new_date

    def setId(self, new_id: int) -> None:
        self.__post_id = new_id

    def like(self, account_id: int) -> None:
        if account_id not in self.__likedBy:
            self.__likedBy.append(account_id)

    def unlike(self, account_id: int) -> None:
        if account_id in self.__likedBy:
            self.__likedBy.remove(account_id)

    # ─────────── Helpers & Converters ───────────
    @staticmethod
    def getSingaporeTimezone() -> datetime:
        return datetime.now(pytz.timezone("Asia/Singapore")).replace(tzinfo=None)

    @classmethod
    def from_PostModel(cls, m: PostModel, labels: List[Label]) -> "Post":
        post = cls(
            m.postId,
            m.title,
            m.content,
            m.date,
            m.accountId,
            m.isDeleted,
            labels,
            [Comment.from_CommentModel(c) for c in getattr(m, "comments", [])],
            [
                Violation.from_violationModel(v)
                for v in getattr(m, "postViolations", [])
            ],
            m.account.name if m.account else None,
            m.account.profilePicUrl if m.account else None,
            [like.accountId for like in getattr(m, "postLikes", [])],
        )
        return post

    @classmethod
    def fromDict(cls, data: Dict[str, Any], labels: List[Label]) -> "Post":
        return cls(
            data.get("id", 0),
            data.get("title", ""),
            data.get("content", ""),
            data.get("date", cls.getSingaporeTimezone()),
            data.get("accountId", 0),
            data.get("is_deleted", 0),
            labels,
            [Comment.from_CommentModel(c) for c in data.get("comments", [])],
            [],  # fill violations separately if needed
            data.get("username"),
            data.get("displayPicUrl"),
            data.get("likedBy", []),
        )

    def toDict(self) -> Dict[str, Any]:
        return {
            "id": self.__post_id,
            "username": self.__accountUsername,
            "date": (
                self.__date.isoformat()
                if isinstance(self.__date, datetime)
                else self.__date
            ),
            "labels": [lbl.toDict() for lbl in self.__associated_labels],
            "title": self.__title,
            "content": self.__content,
            "comments": [c.toDict() for c in self.__associated_comments],
            "accountId": self.__accountId,
            "displayPicUrl": self.__accountDisplayPicture,
            "likedBy": self.__likedBy,
        }
