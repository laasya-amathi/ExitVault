from typing import List

from openai import OpenAI

from app.config import OPENAI_API_KEY, OPENAI_MODEL
from app.models import MemoryClaim


def _format_claims(claims: List[MemoryClaim]) -> str:
    if not claims:
        return 'No company memory was found for this question.'

    lines = []
    for claim in claims:
        lines.append(
            f"- {claim.entity} ({claim.kind}, {claim.status}, {claim.confidence})\n"
            f"  Summary: {claim.summary}\n"
            f"  Evidence: {claim.evidence_delayed}/{claim.evidence_total} delayed deliveries; source={claim.evidence_source}\n"
            f"  Note: {claim.note}"
        )
    return '\n'.join(lines)


def generate_answer(question: str, claims: List[MemoryClaim]) -> str:
    context = _format_claims(claims)

    if not OPENAI_API_KEY:
        if not claims:
            return 'I could not find enough verified evidence in the memory layer for this question. I recommend checking the customer, vendor, or process record before acting.'

        top = claims[0]
        if top.status == 'partial':
            return (
                f"Based on ExitVault's Hindsight memory, {top.entity} is only partially supported. "
                f"{top.summary} Company records show {top.evidence_delayed} delayed events out of {top.evidence_total}, "
                f"which means the risk is real but not yet strong enough to treat as a confirmed operational rule."
            )
        if top.status == 'conflict':
            return (
                f"There is a conflict in the organizational memory for {top.entity}. The evidence suggests the process is not fully aligned, "
                f"so the safe answer is to confirm the exact approval path before acting."
            )
        return (
            f"ExitVault found trusted context for {top.entity}. {top.summary} "
            f"This is tied to company evidence and stored as part of the Hindsight memory layer so the next employee can act with context."
        )

    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = (
        "You are ExitVault, an evidence-aware organizational memory assistant. "
        "Answer using only the provided company memory and evidence. Do not fabricate missing facts. "
        "State uncertainty clearly when the evidence is partial or conflicting.\n\n"
        f"Question: {question}\n\n"
        f"Relevant memory:\n{context}\n\n"
        "Reply in a concise but helpful enterprise tone. Mention confidence and evidence where relevant."
    )

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are ExitVault, an evidence-aware enterprise assistant for organizational memory."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=350,
    )
    return response.choices[0].message.content.strip()
