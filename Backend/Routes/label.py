from flask import Blueprint, request, jsonify
from Boundary.LabelBoundary import LabelBoundary 
import traceback



label_bp = Blueprint("label", __name__) 


@label_bp.route('/labels', methods=['GET'])
def getAllLabels():
    """
    Retrieve all labels from the database.
    """
    try:
        labels = LabelBoundary.handleRetrieveAllLabels()  # Use the boundary to handle the retrieval of all labels
        if labels:
            return jsonify([label.toDict() for label in labels]), 200  # Convert each label to a dictionary
        else:
            return jsonify({"error": "No labels found"}), 404
    except Exception as e:
        print(f"Error retrieving labels: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500 
    