from dataclasses import dataclass 

@dataclass 
class Label: 
    labelID: int 
    description: str 
    color: str 

    @classmethod
    def from_dict(cls, data: dict) -> 'Label':
        return cls(
            labelID=data.get('labelId', 0),
            description=data.get('description', ''),
            color=data.get('color', '')
        ) 
    
    @classmethod 
    def to_dict(cls, label: 'Label') -> dict:
        return {
            "labelId": label.labelID,
            "name": label.description,
            "color": label.color
        } 
    @classmethod
    def fromLabelModel(cls, label_model) -> 'Label':
        return cls(
            labelID=label_model.labelId,
            description=label_model.description,
            color=label_model.color.value if label_model.color else ''
        ) 
    
