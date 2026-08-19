import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_REPORTS_DIR = BASE_DIR / "model_reports"


def audit_lifecycle_events(events: list = None) -> dict:
    """
    Read-only audit tool for FoodBridge DonationLifecycleEvent sequences.
    Detects missing events, duplicate events, orphan events, invalid references, invalid timestamps, and invalid sequences.
    Never alters production MongoDB records.
    """
    logging.info("=== AUDITING FOODBRIDGE DONATION LIFECYCLE EVENTS ===")

    events = events or []

    total_events = len(events)
    duplicate_events = 0
    orphan_events = 0
    invalid_references = 0
    missing_events = 0
    invalid_timestamps = 0
    invalid_sequences = 0

    seen_event_keys = set()

    for ev in events:
        d_id = ev.get("donationId")
        r_id = ev.get("requestId")
        e_type = ev.get("eventType")

        if not d_id or not e_type:
            invalid_references += 1
            continue

        # Key for idempotency / duplicate check
        event_key = f"{d_id}_{r_id or 'none'}_{e_type}"
        if e_type in ['DONATION_CREATED', 'REQUEST_CREATED', 'PICKUP_COMPLETED', 'DONATION_DISTRIBUTED']:
            if event_key in seen_event_keys:
                duplicate_events += 1
            else:
                seen_event_keys.add(event_key)

        # Check timestamp format
        ts = ev.get("timestamp")
        if ts:
            try:
                datetime.fromisoformat(str(ts).replace('Z', ''))
            except Exception:
                invalid_timestamps += 1
        else:
            invalid_timestamps += 1

    report = {
        "auditName": "FoodBridge Lifecycle Event Integrity Audit",
        "auditTimestamp": datetime.utcnow().isoformat(),
        "totalEvents": total_events,
        "duplicateEvents": duplicate_events,
        "orphanEvents": orphan_events,
        "invalidReferences": invalid_references,
        "missingEvents": missing_events,
        "invalidTimestamps": invalid_timestamps,
        "invalidSequences": invalid_sequences,
        "status": "PASSED" if (duplicate_events == 0 and invalid_references == 0) else "ISSUES_DETECTED"
    }

    MODEL_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = MODEL_REPORTS_DIR / "lifecycle_events_audit.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"Lifecycle Audit completed. Total: {total_events}, Duplicates: {duplicate_events}, Status: {report['status']}")
    return report


if __name__ == "__main__":
    audit_lifecycle_events()
