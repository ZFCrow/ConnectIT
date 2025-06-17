from dataclasses import dataclass, field 
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from Entity.Label import Label
from Entity.Comment import Comment 
from Entity.Violation import Violation 


from SQLModels.PostModel import PostModel 
from SQLModels.CommentModel import CommentModel 
import pytz 
@dataclass 
class Post: 
    # base data that tallys with the database 
    post_id: int
    title: str
    content: str
    date: Union[datetime, str]
    accountId: int
    isDeleted: int = 0
    
    # classes for associated data 
    associated_labels: List[Label] = field(default_factory=list)  
    associated_comments: List[Comment] = field(default_factory=list)  # Placeholder for comments, can be replaced with actual Comment class 
    associated_violations: List[Violation] = field(default_factory=list)  # Placeholder for violations, can be replaced with actual Violation class 

    # Additional fields for account information (not creating a separate Account entity) 
    accountUsername: Optional[str] = None 
    accountDisplayPicture: Optional[str] = None 

    likes : int = 0  # Placeholder for likes count 
    liked : bool = False  # Placeholder for liked status 

    @staticmethod
    def getSingaporeTimezone() -> pytz.timezone:
        """Get Singapore timezone"""
        return datetime.now(pytz.timezone('Asia/Singapore')).replace(tzinfo=None)  
    
    @classmethod
    def from_PostModel(cls, post_model: PostModel, labels:List[Label] ) -> 'Post':
        """Create Post entity from PostModel instance"""
        liked = any (like.accountId == post_model.accountId for like in post_model.postLikes) if post_model.postLikes else False
        return cls(
            post_id=post_model.postId,
            title=post_model.title,
            content=post_model.content,
            date=post_model.date,
            accountId=post_model.accountId,
            isDeleted=post_model.isDeleted,
            associated_labels=labels, 
            accountUsername=post_model.account.name if post_model.account else None,
            accountDisplayPicture=post_model.account.profilePicUrl if post_model.account else None,
            likes = len(post_model.postLikes) if post_model.postLikes else 0,  # Count of likes from postLikes relationship 
            liked = liked
        ) 
    
    @classmethod 
    def fromDict(cls, data: Dict[str, Any], labels : list[Label]) -> 'Post':
        """Create Post entity from dictionary"""
        return cls(
            post_id=data.get('id', 0),  # Default to 0 if not provided 
            title=data.get('title'),
            content=data.get('content'),
            date=data.get('date', cls.getSingaporeTimezone()),  # Default to current Singapore time if not provided 
            accountId=data.get('accountId'),
            associated_labels=labels,  # Labels should be passed as a list of Label entities 
            isDeleted=data.get('is_deleted', 0)
            
        )
    
    def toDict(self) -> Dict[str, Any]:
        """Convert Post entity to dictionary for JSON serialization"""
        return {
            "id": self.post_id, 
            "username": self.accountUsername, 
            "date": self.date.isoformat() if isinstance(self.date, datetime) else self.date,
            "labels": [label.toDict() for label in self.associated_labels], 
            "title": self.title, 
            "content": self.content, 
            "comments": [comment.toDict(comment) for comment in self.associated_comments], 
            "likes": self.likes,  # Count of likes 
            "liked": self.liked,  # Placeholder for liked status 
            "accountId": self.accountId, 
            "displayPicUrl": self.accountDisplayPicture
        }
    
    # ✅ Helper methods with type hints
    def add_label(self, label: Label) -> None:
        """Add a label to this post"""
        if label not in self.associated_labels:
            self.associated_labels.append(label)
    
    def remove_label(self, label: Label) -> None:
        """Remove a label from this post"""
        if label in self.associated_labels:
            self.associated_labels.remove(label)
    
    def add_comment(self, comment_data: Dict[str, Any]) -> None:
        """Add a comment to this post"""
        self.associated_comments.append(comment_data)
    
    def get_label_ids(self) -> List[int]:
        """Get list of label IDs for this post"""
        return [label.labelID for label in self.associated_labels]
    
    def set_account_info(self, username: str, display_pic_url: Optional[str] = None) -> None:
        """Set account display information"""
        self.accountUsername = username
        self.accountDisplayPicture = display_pic_url

    def addCommentToAssociatedComments(self, comment: Comment) -> None:
        """Add a comment to the post"""
        self.associated_comments.append(comment) 
    
    def populateComments(self, comments: List[CommentModel]) -> None:
        """
        Create the comment entities from the comment models and set them to the post 
        """
        for comment_model in comments:
            comment_entity = Comment.from_CommentModel(comment_model)
            self.addCommentToAssociatedComments(comment_entity)  # Add the comment entity to the post's comments list 