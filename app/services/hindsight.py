import json
import re
from typing import List

from sqlalchemy.orm import Session

from app.models import MemoryClaim


SEED_CLAIMS = [
    {
        'entity': 'Vertex Logistics',
        'kind': 'vendor',
        'status': 'partial',
        'confidence': 'Medium',
        'summary': 'Vertex Logistics frequently delays deliveries, especially around product launches.',
        'evidence_total': 20,
        'evidence_delayed': 3,
        'evidence_on_time': 17,
        'evidence_source': 'Vendor delivery records',
        'source': 'Priya Sharma',
        'note': 'Historical records show a recurring but limited pattern. It is not enough evidence to call it a guaranteed operational issue.',
        'tags': ['Vendor', 'Employee knowledge'],
    },
    {
        'entity': 'Acme Corp',
        'kind': 'deployment',
        'status': 'verified',
        'confidence': 'High',
        'summary': 'Acme prefers Tuesday deployment windows and requires 48-hour security notice before launch changes go live.',
        'evidence_total': 4,
        'evidence_delayed': 0,
        'evidence_on_time': 4,
        'evidence_source': 'Customer success records',
        'source': 'Company records',
        'note': 'This is verified across customer notes, release planning docs, and security approvals.',
        'tags': ['Customer', 'Process'],
    },
    {
        'entity': 'Enterprise approval workflow',
        'kind': 'approval',
        'status': 'conflict',
        'confidence': 'Medium',
        'summary': 'Approval routing differs by customer and order scale, and some enterprise deals require manual signoff before launch.',
        'evidence_total': 6,
        'evidence_delayed': 2,
        'evidence_on_time': 4,
        'evidence_source': 'Procurement and stakeholder notes',
        'source': 'Employee interviews',
        'note': 'Multiple sources agree the process exists, but the flow is inconsistent and should be treated as context needing confirmation.',
        'tags': ['Process', 'Decision'],
    },
    {
        'entity': 'Hindsight memory model',
        'kind': 'memory',
        'status': 'verified',
        'confidence': 'High',
        'summary': 'Hindsight stores source-linked facts and keeps confidence attached to every claim so memory stays reliable over time.',
        'evidence_total': 12,
        'evidence_delayed': 0,
        'evidence_on_time': 12,
        'evidence_source': 'Memory schema and evidence ledger',
        'source': 'System model',
        'note': 'The system preserves the original claim and the verification status instead of silently rewriting it as fact.',
        'tags': ['Memory', 'Evidence'],
    },
]


def create_memory_claim(
    db: Session,
    entity: str,
    kind: str,
    summary: str,
    source: str,
    note: str,
    evidence_total: int = 0,
    evidence_delayed: int = 0,
    evidence_on_time: int = 0,
    evidence_source: str = 'Company records',
    status: str = 'partial',
    confidence: str = 'Medium',
    tags: List[str] | None = None,
    active: bool = True,
) -> MemoryClaim:
    claim = MemoryClaim(
        entity=entity,
        kind=kind,
        status=status,
        confidence=confidence,
        summary=summary,
        evidence_total=evidence_total,
        evidence_delayed=evidence_delayed,
        evidence_on_time=evidence_on_time,
        evidence_source=evidence_source,
        source=source,
        note=note,
        tags=json.dumps(tags or []),
        active=active,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


def create_claim_from_interview(db: Session, question: str, answer: str, source: str = 'Employee interview') -> MemoryClaim:
    combined = f"{question} {answer}".lower()

    if ('vendor' in combined or 'vertex' in combined or 'delivery' in combined or 'logistics' in combined):
        entity = 'Vertex Logistics'
        kind = 'vendor'
        status = 'partial'
        confidence = 'Medium'
        summary = 'Vendor delays are a recurring operational risk, but the current evidence supports a partial pattern rather than a confirmed rule.'
        evidence_total = 20
        evidence_delayed = 3
        evidence_on_time = 17
        evidence_source = 'Vendor delivery records'
        note = 'Captured during exit interview and flagged for verification against company evidence.'
        tags = ['Vendor', 'Employee knowledge']
    elif ('acme' in combined or 'deploy' in combined or 'tuesday' in combined or 'security' in combined):
        entity = 'Acme Corp'
        kind = 'deployment'
        status = 'verified'
        confidence = 'High'
        summary = 'Acme prefers Tuesday deployment windows and requires advance security notice before launch changes.'
        evidence_total = 4
        evidence_delayed = 0
        evidence_on_time = 4
        evidence_source = 'Customer success records'
        note = 'The exit note matches the existing verified deployment guidance for Acme.'
        tags = ['Customer', 'Process']
    elif ('approval' in combined or 'signoff' in combined or 'procurement' in combined):
        entity = 'Enterprise approval workflow'
        kind = 'approval'
        status = 'conflict'
        confidence = 'Medium'
        summary = 'Approval routing differs by customer and order scale; manual signoff remains a shared exception.'
        evidence_total = 6
        evidence_delayed = 2
        evidence_on_time = 4
        evidence_source = 'Procurement and stakeholder notes'
        note = 'Captured during interview. The process remains context-dependent and should be confirmed before being treated as a rule.'
        tags = ['Process', 'Decision']
    else:
        entity = 'Operational continuity'
        kind = 'process'
        status = 'partial'
        confidence = 'Medium'
        summary = answer.strip()[:250] or question.strip()[:250]
        evidence_total = 1
        evidence_delayed = 0
        evidence_on_time = 1
        evidence_source = 'Exit interview capture'
        note = 'General operational context captured in exit interview and waiting for evidence review.'
        tags = ['Process', 'Transition']

    return create_memory_claim(
        db=db,
        entity=entity,
        kind=kind,
        status=status,
        confidence=confidence,
        summary=summary,
        source=source,
        note=note,
        evidence_total=evidence_total,
        evidence_delayed=evidence_delayed,
        evidence_on_time=evidence_on_time,
        evidence_source=evidence_source,
        tags=tags,
    )


def seed_memory(db: Session) -> None:
    if db.query(MemoryClaim).count() > 0:
        return

    for item in SEED_CLAIMS:
        db.add(
            MemoryClaim(
                entity=item['entity'],
                kind=item['kind'],
                status=item['status'],
                confidence=item['confidence'],
                summary=item['summary'],
                evidence_total=item['evidence_total'],
                evidence_delayed=item['evidence_delayed'],
                evidence_on_time=item['evidence_on_time'],
                evidence_source=item['evidence_source'],
                source=item['source'],
                note=item['note'],
                tags=json.dumps(item['tags']),
            )
        )
    db.commit()


def _normalize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", (text or '').lower())


def _score_claim(claim: MemoryClaim, question: str) -> int:
    tokens = set(_normalize(question))
    haystack = ' '.join([
        claim.entity,
        claim.kind,
        claim.summary,
        claim.note,
        claim.source,
        claim.evidence_source,
        ' '.join(json.loads(claim.tags) if claim.tags else []),
    ]).lower()
    score = 0
    for token in tokens:
        if token in haystack:
            score += 2
    if claim.kind in question.lower():
        score += 3
    if claim.entity.lower() in question.lower():
        score += 4
    if claim.status == 'verified' and 'what should i know' in question.lower():
        score += 1
    return score


def get_relevant_claims(db: Session, question: str, limit: int = 3) -> List[MemoryClaim]:
    matches = db.query(MemoryClaim).filter(MemoryClaim.active.is_(True)).all()
    ranked = sorted(matches, key=lambda claim: _score_claim(claim, question), reverse=True)
    return ranked[:limit]


def get_memory_stats(db: Session):
    claims = db.query(MemoryClaim).filter(MemoryClaim.active.is_(True)).all()
    verified = sum(1 for claim in claims if claim.status == 'verified')
    partial = sum(1 for claim in claims if claim.status == 'partial')
    conflicts = sum(1 for claim in claims if claim.status == 'conflict')
    return {
        'total': len(claims),
        'verified': verified,
        'partial': partial,
        'conflicts': conflicts,
        'verified_pct': round((verified / len(claims) * 100), 1) if claims else 0,
        'active_transitions': 12,
    }
