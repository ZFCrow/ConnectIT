from flask import Blueprint, jsonify
from Control.ViolationControl import ViolationControl
import traceback


violation_bp = Blueprint("violation", __name__)


@violation_bp.route("/violations", methods=["GET"])
def violations():
    """
    Endpoint to check for violations.
    """
    try:

        violations = ViolationControl.retrieveAllViolations()
        if violations:
            # Convert each violation to a dictionary
            return jsonify([violation.toDict() for violation in violations]), 200
        else:
            return jsonify({"message": "No violations found"}), 404

    except Exception as e:
        print(f"Error checking violations: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
