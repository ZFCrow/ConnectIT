import os
from pathlib import Path
from sshtunnel import SSHTunnelForwarder
import pymysql


def create_ssh_tunnel():
    """
    Starts an SSH tunnel and returns the SSHTunnelForwarder object.
    """
    ssh_host = os.getenv("SSH_HOST")
    ssh_port = int(os.getenv("SSH_PORT"))
    ssh_user = os.getenv("SSH_USER")
    ssh_key = Path(os.getenv("PEM_FILE", "")).expanduser()

    if not ssh_key.exists():
        raise FileNotFoundError(f"SSH key not found at {ssh_key}")

    remote_host = os.getenv("REMOTE_MYSQL_HOST", "127.0.0.1")
    remote_port = int(os.getenv("MYSQL_REMOTE_PORT"))

    tunnel = SSHTunnelForwarder(
        (ssh_host, ssh_port),
        ssh_username=ssh_user,
        ssh_pkey=str(ssh_key),
        remote_bind_address=(remote_host, remote_port),
    )
    tunnel.start()
    print(
        f"→ SSH tunnel open: localhost:{tunnel.local_bind_port} → \
          {remote_host}:{remote_port}"
    )
    return tunnel


def create_db_connection(tunnel=None):
    """
    Uses an existing SSH tunnel to connect to MySQL \
        and returns the pymysql.Connection.
    """
    if tunnel:
        db_host = "127.0.0.1"
        db_port = tunnel.local_bind_port
    else:
        db_host = os.getenv("MYSQL_CONTAINER_NAME")
        db_port = int(os.getenv("MYSQL_CONTAINER_PORT"))
    db_user = os.getenv("MYSQL_USER")
    db_password = os.getenv("MYSQL_PASSWORD")
    db_name = os.getenv("MYSQL_DATABASE")

    conn = pymysql.connect(
        host=db_host, port=db_port, user=db_user, password=db_password, db=db_name
    )
    print("→ MySQL connection established through SSH tunnel")
    return conn


def sshFlow():
    # 1) establish the SSH tunnel
    tunnel = create_ssh_tunnel()
    tables = []
    try:
        # 2) open your DB connection over that tunnel
        conn = create_db_connection(tunnel)
        try:
            with conn.cursor() as cursor:
                cursor.execute("SHOW TABLES;")
                for table in cursor.fetchall():
                    print(table)
                    tables.append(table)
        finally:
            conn.close()
            print("→ Database connection closed")
    finally:
        tunnel.stop()
        print("→ SSH tunnel closed")
        return tables


def noSshFlow():
    # 1) open your DB connection
    conn = create_db_connection()
    tables = []
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES;")
            for table in cursor.fetchall():
                print(table)
                tables.append(table)
    finally:
        conn.close()
        print("→ Database connection closed")
        return tables


if __name__ == "__main__":
    if os.environ.get("USE_SSH_TUNNEL", "False").lower() in ("1", "true", "yes"):
        sshFlow()
    else:
        noSshFlow()
