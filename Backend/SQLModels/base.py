from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy.orm import sessionmaker
import os 
from db import create_ssh_tunnel


engine = None 
SessionLocal = None 
Base = declarative_base() 
sshTunnel = None 


def initDatabase(): 
    
    """
    Initializes the database connection and session.
    """ 
    global engine, SessionLocal, sshTunnel 

    useSSH = os.environ.get("USE_SSH_TUNNEL", "False") in ("1", "true", "yes") 

    if useSSH: 
        print (" -> Creating SSH Tunnel...")
        sshTunnel = create_ssh_tunnel() 

        # use the SSH tunnel to connect to the database (host and the randomly assigned port) 
        dbHost = "127.0.0.1"
        dbPort = sshTunnel.local_bind_port 

        print(f"→ SSH tunnel active: localhost:{dbPort} → EC2:3306")