from typing import List, Optional

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=2)
    user_name: Optional[str] = 'AM'


class InterviewSubmitRequest(BaseModel):
    question: str = Field(..., min_length=2)
    answer: str = Field(..., min_length=1)
    user_name: Optional[str] = 'Priya'


class MemoryClaimRead(BaseModel):
    id: int
    entity: str
    kind: str
    status: str
    confidence: str
    summary: str
    evidence: dict
    source: str
    note: str
    tags: List[str]
    active: bool


class AskResponse(BaseModel):
    question: str
    answer: str
    claims: List[MemoryClaimRead]
    memory_count: int
