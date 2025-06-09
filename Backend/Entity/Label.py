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
