from sqlalchemy import create_engine, text
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

        print(f"→ SSH tunnel active: localhost:{dbPort} → EC2:{os.getenv("MYSQL_REMOTE_PORT")}")

    else : 
        # connect locally to the db
        dbHost = os.getenv("MYSQL_CONTAINER_NAME")
        dbPort = int(os.getenv("MYSQL_CONTAINER_PORT"))  
    

    # the db user credentials  
    dbUser = os.getenv("MYSQL_USER") 
    dbPassword = os.getenv("MYSQL_PASSWORD") 
    dbName = os.getenv("MYSQL_DATABASE") 


    # build the URL / connection string

    databaseURL = f"mysql+pymysql://{dbUser}:{dbPassword}@{dbHost}:{dbPort}/{dbName}" 
    print(f"-> SQLAlchemy connecting to {databaseURL}") 

    #create the engine 
    engine = create_engine(databaseURL, echo=True, pool_pre_ping=True) 
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 


    # test connection 

    try : 
        with engine.connect() as connection:
            print ("→ Testing database connection...") 
            result = connection.execute(text("SHOW TABLES;")) 
            
            print("→ Database connection established successfully.") 
            return result.fetchall()  # Return the list of tables if needed 
    except: 
        print("→ Failed to connect to the database. Please check your connection settings.") 
        if useSSH:
            # sshTunnel.stop() 

            #print("→ SSH tunnel closed due to connection failure.") 
            print (f" -> SSH tunnel is still active on localhost:{dbPort}")