"""
Regex patterns for detecting sensitive information.
TR-AI-02: Regex-based detection for emails, phone numbers, API keys
"""

import re
from typing import List, Tuple, Dict

class SensitivePatterns:
    """
    Collection of regex patterns for detecting sensitive data.
    """
    
    # Email pattern
    EMAIL_PATTERN = re.compile(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        re.IGNORECASE
    )
    
    # Phone number patterns (various formats)
    PHONE_PATTERNS = [
        re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'),  # US format: 123-456-7890
        re.compile(r'\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b'),  # (123) 456-7890
        re.compile(r'\b\+?\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b'),  # International
        re.compile(r'\b\d{10,}\b'),  # Generic 10+ digits
    ]
    
    # API Key patterns (common formats)
    API_KEY_PATTERNS = [
        re.compile(r'\b[A-Za-z0-9]{32,}\b'),  # Generic long alphanumeric
        re.compile(r'\bAKIA[0-9A-Z]{16}\b'),  # AWS Access Key
        re.compile(r'\bsk-[A-Za-z0-9]{32,}\b'),  # OpenAI/Stripe keys
        re.compile(r'\bpk_[A-Za-z0-9]{32,}\b'),  # Stripe publishable keys
        re.compile(r'\bghp_[A-Za-z0-9]{36}\b'),  # GitHub Personal Access Token
        re.compile(r'\bxox[baprs]-[0-9]{11}-[0-9]{11}-[A-Za-z0-9]{24}\b'),  # Slack tokens
    ]
    
    # Credit card patterns (basic detection)
    CREDIT_CARD_PATTERN = re.compile(
        r'\b(?:\d{4}[-\s]?){3}\d{4}\b'
    )
    
    # SSN pattern (US)
    SSN_PATTERN = re.compile(
        r'\b\d{3}-\d{2}-\d{4}\b'
    )
    
    # IP addresses
    IP_PATTERN = re.compile(
        r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    )
    
    @classmethod
    def find_all_sensitive_data(cls, text: str) -> List[Tuple[str, str]]:
        """
        Find all sensitive data in text.
        Returns list of (pattern_type, matched_text) tuples.
        """
        findings = []
        
        # Check emails
        for match in cls.EMAIL_PATTERN.finditer(text):
            findings.append(('email', match.group()))
        
        # Check phone numbers
        for pattern in cls.PHONE_PATTERNS:
            for match in pattern.finditer(text):
                findings.append(('phone', match.group()))
        
        # Check API keys
        for pattern in cls.API_KEY_PATTERNS:
            for match in pattern.finditer(text):
                findings.append(('api_key', match.group()))
        
        # Check credit cards
        for match in cls.CREDIT_CARD_PATTERN.finditer(text):
            findings.append(('credit_card', match.group()))
        
        # Check SSN
        for match in cls.SSN_PATTERN.finditer(text):
            findings.append(('ssn', match.group()))
        
        # Check IP addresses (only private/internal IPs to avoid false positives)
        for match in cls.IP_PATTERN.finditer(text):
            ip = match.group()
            parts = ip.split('.')
            # Check if it's a private IP (10.x, 192.168.x, 172.16-31.x)
            if (parts[0] == '10' or 
                (parts[0] == '192' and parts[1] == '168') or
                (parts[0] == '172' and 16 <= int(parts[1]) <= 31)):
                findings.append(('ip_address', ip))
        
        return findings


