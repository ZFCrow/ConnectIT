from dataclasses import dataclass 
from datetime import datetime 
from typing import Union 
import pytz 


@dataclass 
class Comment: 
    commentId: int 
    content: str 
    createdAt: datetime
    accountId: int 
    postId: int 
    isDeleted : bool = False 


    #! Additional fields for account information (not creating a separate Account entity) 
    accountUsername: str = None 
    accountDisplayPicture: str = None 


    @classmethod
    def from_CommentModel(cls, comment_model) -> 'Comment':
        """Create Comment entity from CommentModel instance"""
        #createdAt = cls._parse_datetime(comment_model.createdAt)
        return cls(
            commentId=comment_model.commentId,
            content=comment_model.content,
            createdAt=comment_model.createdAt ,
            accountId=comment_model.accountId,
            postId=comment_model.postId,
            isDeleted=bool(comment_model.isDeleted),
            accountUsername=comment_model.account.name if comment_model.account else None,
            accountDisplayPicture=comment_model.account.profilePicUrl if comment_model.account else None
        ) 
    
    # @classmethod
    # def toDict (cls, comment: 'Comment') -> dict:
    #     """Convert Comment entity to dictionary"""
    #     return {
    #         'commentId': comment.commentId,
    #         'createdAt': comment.createdAt.isoformat() if isinstance(comment.createdAt, datetime) else comment.createdAt,
    #         'accountId': comment.accountId,
    #         'username': comment.accountUsername,
    #         'content': comment.content,
    #         'displayPicUrl': comment.accountDisplayPicture
    #     } 
    
    def toDict (self) -> dict:
        """Convert Comment entity to dictionary for JSON serialization"""
        return {
            'commentId': self.commentId,
            'content': self.content,
            'createdAt': self.createdAt.isoformat() if isinstance(self.createdAt, datetime) else self.createdAt,
            'accountId': self.accountId,
            'postId': self.postId,
            'isDeleted': self.isDeleted,
            'username': self.accountUsername,
            'displayPicUrl': self.accountDisplayPicture
        }

    @staticmethod
    def getSingaporeTimezone() -> pytz.timezone:
        """Get Singapore timezone"""
        return datetime.now(pytz.timezone('Asia/Singapore')).replace(tzinfo=None)  
        


    @classmethod 
    def fromDict(cls, data: dict) -> 'Comment':
        """Create Comment entity from dictionary"""
        # createdAt = cls._parse_datetime(data.get('createdAt', datetime.now()))
        return cls(
            commentId=data.get('commentId', 0),
            content=data.get('content', ''),
            createdAt=data.get('createdAt', cls.getSingaporeTimezone()), 
            accountId=data.get('accountId', 0),
            postId=data.get('postId', 0),
            isDeleted=data.get('isDeleted', False),
            accountUsername=data.get('accountUsername', None),
            accountDisplayPicture=data.get('accountDisplayPicture', None)
        ) 