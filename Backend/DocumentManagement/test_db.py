from sqlalchemy import text
from app.infra.database import engine

with engine.connect() as conn:
    result = conn.execute(text("SELECT 'Hello from Oracle DB!' FROM dual"))
    print(result.fetchall())
