from Boundary.TableDataGateway.LabelGateway import LabelGateway


class LabelControl:

    def __init__(self):
        pass

    @staticmethod
    def retrieveAllLabels() -> list:
        """
        Retrieve all labels from the database.
        """
        # Fetch all labels using the gateway
        labels = LabelGateway.getAllLabels()
        return labels  # Return the list of labels
