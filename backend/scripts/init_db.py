from app.database import Base, engine
from app.models.database_models import DetectionHistory


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables berhasil dibuat.")


if __name__ == "__main__":
    init_db()