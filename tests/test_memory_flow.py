from app.database import Base, SessionLocal, engine
from app.services.hindsight import create_memory_claim, get_relevant_claims, seed_memory


def test_interview_claim_created_and_retrieved():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_memory(db)
        claim = create_memory_claim(
            db,
            entity='Vertex Logistics',
            kind='vendor',
            summary='Delivery delays are a recurring but limited risk.',
            source='Employee interview',
            note='Captured during exit interview.',
            evidence_total=20,
            evidence_delayed=3,
            evidence_on_time=17,
            evidence_source='Vendor delivery records',
            status='partial',
            confidence='Medium',
            tags=['Vendor', 'Employee knowledge'],
        )
        matches = get_relevant_claims(db, 'Vertex Logistics vendor delay', limit=3)
        assert claim.id is not None
        assert any(item.entity == 'Vertex Logistics' for item in matches)
    finally:
        db.close()
