from SQLModels.base import db_context
from SQLModels.LabelModel import LabelModel
from Entity.Label import Label
from typing import Optional, List, Dict
from sqlalchemy.orm import joinedload


class LabelGateway:
    """
    Gateway since it pulls all labels at once
    """

    labelsCache: Dict[int, Label] = {}

    @staticmethod
    def getAllLabels() -> List[Label]:
        """
        Find all labels from table
        """

        with db_context.session_scope() as session:
            labelModels = session.query(LabelModel).options(
                joinedload(
                    LabelModel.postLabels
                    )  # Load associated post labels
              ).all()
            if labelModels:
                LabelGateway.labelsCache = {
                    lm.labelId: Label.fromLabelModel(lm)
                    for lm in labelModels}
                return list(LabelGateway.labelsCache.values())
            else:
                return []

    @staticmethod
    def getLabelbyId(labelId: int) -> Optional[Label]:
        """
        find label by id
        -> search in cache first, then db
        """
        if labelId in LabelGateway.labelsCache:
            return LabelGateway.labelsCache[labelId]

        with db_context.session_scope() as session:
            labelModel = session.query(
                LabelModel
                ).filter(
                    LabelModel.labelId == labelId
                    ).first()
            if labelModel:
                label = Label.fromLabelModel(labelModel)
                LabelGateway.labelsCache[labelId] = label
                return label
            else:
                return None

    @staticmethod
    def getLabelsbyIds(labelIds: List[int]) -> List[Label]:
        """
        Find labels by a list of ids
        -> search in cache first, then db
        """
        labels = []
        for labelId in labelIds:
            if labelId in LabelGateway.labelsCache:
                labels.append(LabelGateway.labelsCache[labelId])
            else:
                label = LabelGateway.getLabelbyId(labelId)
                if label:
                    labels.append(label)
        return labels
