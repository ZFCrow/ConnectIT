class Post: 
    def __init__(self, post_id, title, content, date, account_id, is_deleted=0):
        self.post_id = post_id
        self.title = title
        self.content = content
        self.date = date
        self.account_id = account_id
        self.is_deleted = is_deleted

    def __repr__(self):
        return f"Post(post_id={self.post_id}, title='{self.title}', content='{self.content}', date='{self.date}', account_id={self.account_id}, is_deleted={self.is_deleted})"
    
    @classmethod
    def from_PostModel(cls, post_model):
        return cls(
            post_id=post_model.postID,
            title=post_model.title,
            content=post_model.content,
            date=post_model.date,
            account_id=post_model.accountId,
            is_deleted=post_model.isDeleted
        ) 