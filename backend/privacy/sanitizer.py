"""
Privacy sanitizer for removing sensitive data from prompts.
TR-AI-01: Prompt must pass sanitizer before LLM
TR-AI-03: Raw prompt must never be logged
TR-AI-04: Sanitized prompt only used for inference
"""

from typing import Dict, List, Tuple
from backend.privacy.patterns import SensitivePatterns

class SanitizationResult:
    """Result of sanitization process."""
    
    def __init__(self, sanitized_text: str, findings: List[Tuple[str, str]], was_sanitized: bool):
        self.sanitized_text = sanitized_text
        self.findings = findings  # List of (pattern_type, original_text) tuples
        self.was_sanitized = was_sanitized
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for logging (without sensitive data)."""
        return {
            'was_sanitized': self.was_sanitized,
            'findings_count': len(self.findings),
            'finding_types': list(set(f[0] for f in self.findings))
        }

def sanitize_prompt(prompt: str) -> SanitizationResult:
    """
    Sanitize a prompt by removing sensitive data.
    
    Args:
        prompt: Original prompt text
        
    Returns:
        SanitizationResult with sanitized text and findings
    """
    if not prompt:
        return SanitizationResult("", [], False)
    
    # Find all sensitive data
    findings = SensitivePatterns.find_all_sensitive_data(prompt)
    
    if not findings:
        return SanitizationResult(prompt, [], False)
    
    # Replace sensitive data with placeholders
    sanitized_text = prompt
    for pattern_type, matched_text in findings:
        # Use different placeholders based on type
        placeholder = _get_placeholder(pattern_type)
        sanitized_text = sanitized_text.replace(matched_text, placeholder)
    
    return SanitizationResult(sanitized_text, findings, True)

def _get_placeholder(pattern_type: str) -> str:
    """Get placeholder text for different pattern types."""
    placeholders = {
        'email': '[EMAIL_REDACTED]',
        'phone': '[PHONE_REDACTED]',
        'api_key': '[API_KEY_REDACTED]',
        'credit_card': '[CARD_REDACTED]',
        'ssn': '[SSN_REDACTED]',
        'ip_address': '[IP_REDACTED]'
    }
    return placeholders.get(pattern_type, '[SENSITIVE_DATA_REDACTED]')


