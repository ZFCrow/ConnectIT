from dataclasses import dataclass 
from datetime import datetime 
from typing import Union 

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
        createdAt = cls._parse_datetime(comment_model.createdAt)
        return cls(
            commentId=comment_model.commentId,
            content=comment_model.content,
            createdAt=createdAt,
            accountId=comment_model.accountId,
            postId=comment_model.postId,
            isDeleted=bool(comment_model.isDeleted),
            accountUsername=comment_model.account.name if comment_model.account else None,
            accountDisplayPicture=comment_model.account.profilePicUrl if comment_model.account else None
        ) 
    
    @classmethod
    def toDict (cls, comment: 'Comment') -> dict:
        """Convert Comment entity to dictionary"""
        return {
            'commentId': comment.commentId,
            'createdAt': comment.createdAt.isoformat() if isinstance(comment.createdAt, datetime) else comment.createdAt,
            'accountId': comment.accountId,
            'username': comment.accountUsername,
            'content': comment.content,
            'displayPicUrl': comment.accountDisplayPicture
        } 

    @staticmethod
    def _parse_datetime(date_input: Union[str, datetime]) -> datetime:
        """Parse various date formats to datetime object"""
        if isinstance(date_input, datetime):
            return date_input
        elif isinstance(date_input, str):
            # ✅ Try different string formats
            try:
                # ISO format: "2025-06-13T10:30:00"
                return datetime.fromisoformat(date_input.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Alternative format: "2025-06-13 10:30:00"
                    return datetime.strptime(date_input, "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    try:
                        # Date only: "2025-06-13"
                        return datetime.strptime(date_input, "%Y-%m-%d")
                    except ValueError:
                        # ✅ Fallback to current time
                        print(f"Warning: Could not parse date '{date_input}', using current time")
                        return datetime.now()
        else:
            # ✅ Fallback for other types
            return datetime.now()