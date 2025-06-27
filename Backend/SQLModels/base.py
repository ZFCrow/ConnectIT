# Backend/SQLModels/DatabaseContext.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import os 
from typing import Optional, List, Dict, Any
from sshtunnel import SSHTunnelForwarder
from pathlib import Path

Base = declarative_base()


class DatabaseContext:
    """
    Database context manager with SSH tunnel support - similar to Entity Framework DbContext
    """
    
    def __init__(self):
        self.engine: Optional[object] = None
        self.SessionLocal: Optional[object] = None
        self.ssh_tunnel: Optional[object] = None
        self._is_initialized = False
        self.connection_info = {}
        self.initialize()  # Automatically initialize on instantiation 

    def initialize(self) -> bool:
        """Initialize database connection - equivalent to EF's OnConfiguring"""
        if self._is_initialized:
            print("→ Database context already initialized")
            return True
            
        try:
            print("→ Initializing Database Context...")
            self._setup_connection()
            self._create_engine()
            self._test_connection()
            self._is_initialized = True
            print("→ Database Context initialized successfully!")
            return True
            
        except Exception as e:
            print(f"→ Database Context initialization failed: {e}")
            if self.ssh_tunnel:
                print(f"→ SSH tunnel remains active on localhost:{self.ssh_tunnel.local_bind_port}")
            raise e
        
    def create_ssh_tunnel(self):
        """
        Starts an SSH tunnel and returns the SSHTunnelForwarder object.
        """
        ssh_host = os.getenv("SSH_HOST")
        ssh_port = int(os.getenv("SSH_PORT"))
        ssh_user = os.getenv("SSH_USER")
        ssh_key  = Path(os.getenv("PEM_FILE", "")).expanduser()

        if not ssh_key.exists():
            raise FileNotFoundError(f"SSH key not found at {ssh_key}")

        remote_host = os.getenv("REMOTE_MYSQL_HOST", "127.0.0.1")
        remote_port = int(os.getenv("MYSQL_REMOTE_PORT"))

        tunnel = SSHTunnelForwarder(
            (ssh_host, ssh_port),
            ssh_username   = ssh_user,
            ssh_pkey       = str(ssh_key),
            remote_bind_address = (remote_host, remote_port),
        )
        tunnel.start()
        print(f"→ SSH tunnel open: localhost:{tunnel.local_bind_port} → {remote_host}:{remote_port}")
        return tunnel 
    
    def _setup_connection(self):
        """Setup SSH tunnel or direct connection"""
        use_ssh = os.environ.get("USE_SSH_TUNNEL", "False") in ("1", "true", "yes")
        
        if use_ssh:
            print("→ Setting up SSH tunnel connection...")
            self.ssh_tunnel = self.create_ssh_tunnel()
            self.connection_info = {
                'host': "127.0.0.1",
                'port': self.ssh_tunnel.local_bind_port,
                'connection_type': 'SSH Tunnel',
                'remote_host': os.getenv('SSH_HOST'),
                'remote_port': os.getenv('MYSQL_REMOTE_PORT')
            }
            print(f"→ SSH tunnel active: localhost:{self.connection_info['port']} → {self.connection_info['remote_host']}:{self.connection_info['remote_port']}")
        else:
            print("→ Setting up direct connection...")
            self.connection_info = {
                'host': os.getenv("MYSQL_CONTAINER_NAME"),
                'port': int(os.getenv("MYSQL_CONTAINER_PORT")),
                'connection_type': 'Direct'
            }
            print(f"→ Direct connection: {self.connection_info['host']}:{self.connection_info['port']}")
    
    def _create_engine(self):
        """Create SQLAlchemy engine and session factory"""
        db_credentials = {
            'user': os.getenv("MYSQL_USER"),
            'password': os.getenv("MYSQL_PASSWORD"),
            'database': os.getenv("MYSQL_DATABASE")
        }
        
        connection_string = (
            f"mysql+pymysql://{db_credentials['user']}:{db_credentials['password']}"
            f"@{self.connection_info['host']}:{self.connection_info['port']}/{db_credentials['database']}"
        )
        
        print(f"→ Creating engine: mysql+pymysql://{db_credentials['user']}:***@{self.connection_info['host']}:{self.connection_info['port']}/{db_credentials['database']}")
        
        self.engine = create_engine(
            connection_string, 
            echo=True, 
            pool_pre_ping=True,
            pool_recycle=3600  # Recycle connections every hour
        )
        
        self.SessionLocal = sessionmaker(
            autocommit=False, 
            autoflush=False, 
            bind=self.engine
        )
    
    def _test_connection(self):
        """Test database connection"""
        with self.engine.connect() as connection:
            print("→ Testing database connection...")
            
            # Test basic connectivity
            result = connection.execute(text("SELECT 1 AS test"))
            test_result = result.fetchone()
            print(f"→ Connection test successful: {test_result}")
            

    
    def get_session(self):
        """Get a database session - equivalent to EF's DbContext"""
        if not self._is_initialized:
            raise RuntimeError("Database context not initialized. Call initialize() first.")
        return self.SessionLocal()
    
    def get_engine(self):
        """Get the SQLAlchemy engine"""
        if not self._is_initialized:
            raise RuntimeError("Database context not initialized. Call initialize() first.")
        return self.engine
    
    @contextmanager
    def session_scope(self):
        """Transactional scope - like EF's using(context) pattern"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def create_database(self):
        if not self._is_initialized:
            raise RuntimeError("Database context not initialized.")

        try:
            print("→ Registering models...")
            self._register_models()

            print("→ Checking for missing tables...")
            existing = set(self.get_tables())
            all_models = set(Base.metadata.tables.keys())
            missing = all_models - existing

            if not missing:
                print("✓ All tables already exist — nothing to create.")
                return False

            print(f"→ Creating missing tables: {missing}")
            Base.metadata.create_all(bind=self.engine)
            print("✅ Database schema created successfully!")
            return True

        except Exception as e:
            print(f"✗ Failed to create database schema: {e}")
            return False
    
    def _register_models(self):
        """Register all models with Base - equivalent to EF's DbSet properties"""
        try:

            
            # Add other models as you create them
            
            registered_models = [cls.__name__ for cls in Base.__subclasses__()]
            print(f"→ Models registered: {registered_models}")
            
        except ImportError as e:
            print(f"✗ Failed to import models: {e}")
            raise
    
    def get_table_info(self, table_name: str) -> Optional[List[Dict[str, Any]]]:
        """Get table schema information"""
        if not self._is_initialized:
            raise RuntimeError("Database context not initialized.")
        
        try:
            with self.session_scope() as session:
                result = session.execute(text(f"DESCRIBE {table_name}"))
                columns = []
                for row in result.fetchall():
                    columns.append({
                        "field": row[0],
                        "type": row[1],
                        "null": row[2],
                        "key": row[3],
                        "default": row[4],
                        "extra": row[5]
                    })
                return columns
        except Exception as e:
            print(f"→ Failed to describe table {table_name}: {e}")
            return None
    
    def get_tables(self) -> List[str]:
        """Get list of all tables"""
        if not self._is_initialized:
            raise RuntimeError("Database context not initialized.")
            
        with self.session_scope() as session:
            result = session.execute(text("SHOW TABLES"))
            return [row[0] for row in result.fetchall()]
    
    def execute_raw_sql(self, sql: str, params: dict = None):
        """Execute raw SQL - equivalent to EF's Database.ExecuteSqlRaw()"""
        with self.session_scope() as session:
            if params:
                result = session.execute(text(sql), params)
            else:
                result = session.execute(text(sql))
            return result.fetchall()
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get current connection information"""
        return {
            'initialized': self._is_initialized,
            'connection_type': self.connection_info.get('connection_type'),
            'host': self.connection_info.get('host'),
            'port': self.connection_info.get('port'),
            'ssh_tunnel_active': self.ssh_tunnel is not None,
            'local_tunnel_port': self.ssh_tunnel.local_bind_port if self.ssh_tunnel else None
        }
    
    def dispose(self):
        """Dispose of resources - equivalent to EF's Dispose()"""
        print("→ Disposing Database Context...")
        
        if self.engine:
            self.engine.dispose()
            print("→ Database engine disposed")
        
        if self.ssh_tunnel:
            self.ssh_tunnel.stop()
            print("→ SSH tunnel closed")
            self.ssh_tunnel = None
        
        self._is_initialized = False
        print("→ Database Context disposed")
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.dispose()


# Global instance (singleton pattern)
db_context = DatabaseContext()
db_context.create_database()

#db_context = None

# def get_db_context():
#     global _db_context
#     if _db_context is None:
#         _db_context = DatabaseContext()
#     return _db_context