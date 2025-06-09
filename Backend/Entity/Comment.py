from dataclasses import dataclass 
from datetime import datetime 
@dataclass 
class Comment: 
    commentId: int 
    content: str 
    createdAt: datetime
    accountId: int 
    postId: int 
    
    # @classmethod 
    # def from_dict(cls, data: dict) -> 'Comment': 
    #     return cls(
    #         commentId=data.get('commentId', 0),
    #         content=data.get('content', ''),
    #         createdAt=datetime.fromisoformat(data.get('createdAt', '1970-01-01T00:00:00')),
    #         accountId=data.get('accountId', 0),
    #         postId=data.get('postId', 0)
    #     ) 