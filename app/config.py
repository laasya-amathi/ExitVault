import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./exitvault.db')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
APP_ENV = os.getenv('APP_ENV', 'development')

# PostgreSQL is supported when configured in the environment. The app falls back to SQLite
# for local development so the demo can run without a database server.
if DATABASE_URL.startswith('postgresql'):
    APP_ENV = 'postgres'
