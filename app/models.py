from sqlalchemy import Boolean, Column, Integer, String, Text

from app.database import Base


class MemoryClaim(Base):
    __tablename__ = 'memory_claims'

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String(200), nullable=False)
    kind = Column(String(50), nullable=False)
    status = Column(String(50), default='partial')
    confidence = Column(String(50), default='Medium')
    summary = Column(Text, nullable=False)
    evidence_total = Column(Integer, default=0)
    evidence_delayed = Column(Integer, default=0)
    evidence_on_time = Column(Integer, default=0)
    evidence_source = Column(String(200), default='Company records')
    source = Column(String(200), default='Employee interview')
    note = Column(Text, default='')
    tags = Column(Text, default='[]')
    active = Column(Boolean, default=True)

    def to_json(self):
        return {
            'id': self.id,
            'entity': self.entity,
            'kind': self.kind,
            'status': self.status,
            'confidence': self.confidence,
            'summary': self.summary,
            'evidence': {
                'total': self.evidence_total,
                'delayed': self.evidence_delayed,
                'on_time': self.evidence_on_time,
                'source': self.evidence_source,
            },
            'source': self.source,
            'note': self.note,
            'tags': self.tags.strip('[]').replace('"', '').split(', ') if self.tags else [],
            'active': self.active,
        }
