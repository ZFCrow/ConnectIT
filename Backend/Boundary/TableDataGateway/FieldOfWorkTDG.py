from SQLModels.FieldOfWorkModel import FieldOfWorkModel
from SQLModels.base import db_context


class FieldOfWorkTDG:
    """
    FieldOfWorkTDG (Table Data Gateway) for managing field of work data.
    This class provides methods to interact with the field of work
    data in the database.
    """

    @staticmethod
    def getAllFieldOfWork() -> str:
        """
        Retrieves the field of work description by its ID.

        :param field_of_work_id: The ID of the field of work.
        :return: The description of the field of work.
        """

        with db_context.session_scope() as session:
            field_of_work = session.query(FieldOfWorkModel).all()
            if field_of_work:
                return [f.description for f in field_of_work]
            if field_of_work:
                return field_of_work.description
            return None
