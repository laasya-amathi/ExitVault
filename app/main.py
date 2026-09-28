from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine, get_db
from app.models import MemoryClaim
from app.schemas import AskRequest, InterviewSubmitRequest
from app.services.hindsight import create_claim_from_interview, get_memory_stats, get_relevant_claims, seed_memory
from app.services.llm import generate_answer

app = FastAPI(title='ExitVault API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_memory(db)
    finally:
        db.close()


@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'service': 'ExitVault Hindsight API'}


@app.get('/api/memory/stats')
def read_memory_stats(db: Session = Depends(get_db)):
    result = get_memory_stats(db)
    return {
        'employee': 'Priya Sharma',
        'company': 'NovaTech Solutions',
        'stats': result,
    }


@app.get('/api/memory/claims')
def read_memory_claims(db: Session = Depends(get_db)):
    claims = db.query(MemoryClaim).filter(MemoryClaim.active.is_(True)).all()
    return {'claims': [claim.to_json() for claim in claims]}


@app.post('/api/interview/submit')
def submit_interview_entry(payload: InterviewSubmitRequest, db: Session = Depends(get_db)):
    claim = create_claim_from_interview(db, payload.question, payload.answer, payload.user_name or 'Employee interview')
    return {
        'status': 'saved',
        'message': 'Interview context captured into Hindsight memory.',
        'claim': claim.to_json(),
    }


@app.post('/api/ask')
def ask_exitvault(payload: AskRequest, db: Session = Depends(get_db)):
    claims = get_relevant_claims(db, payload.question, limit=3)
    answer = generate_answer(payload.question, claims)
    return {
        'question': payload.question,
        'answer': answer,
        'claims': [claim.to_json() for claim in claims],
        'memory_count': len(claims),
    }


frontend_dir = Path(__file__).resolve().parent.parent / 'ExitVault'
app.mount('/', StaticFiles(directory=str(frontend_dir), html=True), name='static')
