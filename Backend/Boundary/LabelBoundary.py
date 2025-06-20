from Control.LabelControl import LabelControl


class LabelBoundary: 
    def __init__(self):
        pass 

    @staticmethod
    def handleRetrieveAllLabels() -> list:
        """
        Handle the retrieval of all labels.
        """
        print("Label boundary: Retrieving all labels.")
        labels = LabelControl.retrieveAllLabels()  # Call the control layer to get labels
        print(f"Label boundary: Retrieved {len(labels)} labels.")
        return labels  # Return the list of labels 