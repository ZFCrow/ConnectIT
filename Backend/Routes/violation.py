
from flask import Blueprint, request, jsonify
from Boundary.ViolationBoundary import ViolationBoundary 
import traceback 


violation_bp = Blueprint("violation", __name__)



@violation_bp.route('/violations', methods=['GET'])
def violations():
    """
    Endpoint to check for violations.
    """
    try:
        violations = ViolationBoundary.handleRetrieveAllViolations()  # Use the boundary to handle the retrieval of all violations 
        if violations:
            return jsonify([violation.toDict() for violation in violations]), 200  # Convert each violation to a dictionary
        else:
            return jsonify({"message": "No violations found"}), 404 

    except Exception as e:
        print(f"Error checking violations: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500