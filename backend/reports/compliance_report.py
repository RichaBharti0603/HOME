"""
Compliance report generator.
TR-REP-01: Generate JSON report
TR-REP-02: Include incident summary, AI privacy score, audit log integrity
TR-REP-03: No raw logs exposed
TR-REP-04: Exportable without admin UI
"""

import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pathlib import Path

from backend.audit.logger import AuditLogger, EventType, Severity
from backend.security.incidents import IncidentSeverity

class ComplianceReportGenerator:
    """
    Generates compliance reports.
    TR-REP-01: Generate JSON report
    TR-REP-03: No raw logs exposed
    TR-REP-04: Exportable without admin UI
    """
    
    def __init__(self, audit_logger: Optional[AuditLogger] = None):
        """
        Initialize report generator.
        
        Args:
            audit_logger: Audit logger instance (creates new if not provided)
        """
        self.audit_logger = audit_logger or AuditLogger()
    
    def generate_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Generate compliance report.
        TR-REP-02: Include incident summary, AI privacy score, audit log integrity
        
        Args:
            start_date: Start date for report period (defaults to 30 days ago)
            end_date: End date for report period (defaults to now)
            
        Returns:
            Report dictionary
        """
        if end_date is None:
            end_date = datetime.utcnow()
        
        if start_date is None:
            start_date = end_date - timedelta(days=30)
        
        # Get all events in period
        all_events = self.audit_logger.get_events()
        
        # Filter by date range
        period_events = []
        for event in all_events:
            event_time = datetime.fromisoformat(event['timestamp'])
            if start_date <= event_time <= end_date:
                period_events.append(event)
        
        # Generate report sections
        report = {
            'report_id': f"COMP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'generated_at': datetime.utcnow().isoformat(),
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'audit_log_integrity': self._check_audit_integrity(),
            'incident_summary': self._generate_incident_summary(period_events),
            'ai_privacy_score': self._calculate_privacy_score(period_events),
            'policy_compliance': self._check_policy_compliance(period_events),
            'statistics': self._generate_statistics(period_events)
        }
        
        return report
    
    def _check_audit_integrity(self) -> Dict:
        """
        Check audit log chain integrity.
        TR-REP-02: Include audit log integrity
        """
        is_valid = self.audit_logger.verify_integrity()
        last_hash = self.audit_logger.get_last_hash()
        
        return {
            'chain_valid': is_valid,
            'last_entry_hash': last_hash,
            'verification_timestamp': datetime.utcnow().isoformat()
        }
    
    def _generate_incident_summary(self, events: List[Dict]) -> Dict:
        """
        Generate incident summary.
        TR-REP-02: Include incident summary
        TR-REP-03: No raw logs exposed
        """
        incident_events = [
            e for e in events 
            if e.get('event_type') == EventType.INCIDENT.value
        ]
        
        severity_counts = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        critical_incidents = []
        
        for event in incident_events:
            severity = event.get('severity', 'low')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # TR-REP-03: No raw logs - only include summary info
            if severity == 'critical':
                critical_incidents.append({
                    'timestamp': event.get('timestamp'),
                    'message': event.get('message', '')[:100],  # Truncate
                    'metadata': {}  # Exclude raw metadata
                })
        
        return {
            'total_incidents': len(incident_events),
            'severity_breakdown': severity_counts,
            'critical_incidents': critical_incidents[:10],  # Limit to 10
            'critical_count': severity_counts.get('critical', 0)
        }
    
    def _calculate_privacy_score(self, events: List[Dict]) -> Dict:
        """
        Calculate AI privacy score.
        TR-REP-02: Include AI privacy score
        """
        ai_events = [
            e for e in events 
            if e.get('event_type') == EventType.AI_REQUEST.value
        ]
        
        total_requests = len(ai_events)
        sanitized_count = sum(
            1 for e in ai_events 
            if e.get('metadata', {}).get('was_sanitized', False)
        )
        
        consent_granted = len([
            e for e in events 
            if e.get('event_type') == EventType.CONSENT_GRANTED.value
        ])
        
        consent_denied = len([
            e for e in events 
            if e.get('event_type') == EventType.CONSENT_DENIED.value
        ])
        
        # Calculate score (0-100)
        score = 100.0
        
        if total_requests > 0:
            sanitization_rate = (sanitized_count / total_requests) * 100
            # Deduct points for unsanitized requests
            score -= (100 - sanitization_rate) * 0.5
        
        # Check consent compliance
        total_consent_checks = consent_granted + consent_denied
        if total_consent_checks > 0:
            consent_rate = (consent_granted / total_consent_checks) * 100
            # Deduct points for denied consents
            score -= (100 - consent_rate) * 0.3
        
        score = max(0, min(100, score))
        
        return {
            'score': round(score, 2),
            'total_ai_requests': total_requests,
            'sanitized_requests': sanitized_count,
            'sanitization_rate': round((sanitized_count / total_requests * 100) if total_requests > 0 else 100, 2),
            'consent_granted': consent_granted,
            'consent_denied': consent_denied
        }
    
    def _check_policy_compliance(self, events: List[Dict]) -> Dict:
        """Check policy compliance."""
        violations = [
            e for e in events 
            if e.get('event_type') == EventType.POLICY_VIOLATION.value
        ]
        
        return {
            'total_violations': len(violations),
            'compliance_rate': round(
                (1 - len(violations) / max(len(events), 1)) * 100, 
                2
            )
        }
    
    def _generate_statistics(self, events: List[Dict]) -> Dict:
        """Generate general statistics."""
        event_type_counts = {}
        severity_counts = {}
        
        for event in events:
            event_type = event.get('event_type', 'unknown')
            severity = event.get('severity', 'unknown')
            
            event_type_counts[event_type] = event_type_counts.get(event_type, 0) + 1
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            'total_events': len(events),
            'event_type_breakdown': event_type_counts,
            'severity_breakdown': severity_counts
        }
    
    def export_report(self, report: Dict, output_path: Optional[str] = None) -> str:
        """
        Export report to JSON file.
        TR-REP-04: Exportable without admin UI
        
        Args:
            report: Report dictionary
            output_path: Output file path (defaults to reports/data/)
            
        Returns:
            Path to exported file
        """
        if output_path is None:
            output_dir = Path(__file__).parent / "data"
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / f"compliance_report_{report['report_id']}.json"
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        return str(output_path)

