
import os
import mysql.connector
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

# Keep Render environment variables as the priority
load_dotenv(dotenv_path=ENV_FILE, override=False)


def get_db_connection():

    db_host = os.getenv("DB_HOST")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME")
    db_port = int(os.getenv("DB_PORT", "4000"))

    if not all([db_host, db_user, db_password, db_name]):
        raise ValueError(
            "Database configuration is incomplete."
        )

    connection = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name,
        port=db_port,
        ssl_ca="/etc/secrets/isrgrootx1.pem",
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )

    return connection