from database.session import SessionLocal


class DBService:

    def get_session(self):
        return SessionLocal()

    def save(self, model_instance):
        session = self.get_session()
        try:
            session.add(model_instance)
            session.commit()
            session.refresh(model_instance)
            return model_instance
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def query(self, model_class, filters=None):
        session = self.get_session()
        try:
            q = session.query(model_class)
            if filters:
                for key, value in filters.items():
                    q = q.filter(getattr(model_class, key) == value)
            return q.all()
        except Exception as e:
            raise e
        finally:
            session.close()