from Boundary.TableDataGateway.LabelGateway import LabelGateway 
class LabelControl: 

    def __init__ (self):
        pass 

    @staticmethod 
    def retrieveAllLabels() -> list:
        """
        Retrieve all labels from the database.
        """
        labels = LabelGateway.getAllLabels()  # Fetch all labels using the gateway
        return labels  # Return the list of labels 