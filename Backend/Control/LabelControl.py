from Boundary.TableDataGateway.LabelGateway import LabelGateway
from Entity.Label import Label

class LabelControl:


    def __init__(self):
        pass

    @staticmethod
    def retrieveAllLabels() -> list[Label]:
        """
        Retrieve all labels from the database.
        """
        # Fetch all labels using the gateway
        labels = LabelGateway.getAllLabels()
        return labels  # Return the list of labels
