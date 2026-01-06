"""
Hash chain implementation for tamper-evident logging.
TR-LOG-02: Hash must reference previous entry
TR-LOG-03: Logs must be append-only
"""

import hashlib
import json
from typing import Optional, Dict, List
from datetime import datetime

class HashChain:
    """
    Implements a hash chain for tamper-evident logging.
    Each entry's hash includes the previous entry's hash.
    """
    
    def __init__(self, initial_hash: Optional[str] = None):
        """
        Initialize hash chain.
        
        Args:
            initial_hash: Initial hash value (for chain continuation)
        """
        self.chain: List[Dict] = []
        self.initial_hash = initial_hash or self._generate_genesis_hash()
        self.last_hash = self.initial_hash
    
    def _generate_genesis_hash(self) -> str:
        """Generate initial hash for the chain."""
        genesis_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'type': 'genesis',
            'message': 'Hash chain initialized'
        }
        return self._compute_hash(genesis_data, None)
    
    def _compute_hash(self, data: Dict, previous_hash: Optional[str]) -> str:
        """
        Compute hash for an entry.
        
        Args:
            data: Entry data
            previous_hash: Hash of previous entry
            
        Returns:
            SHA-256 hash as hex string
        """
        # Create deterministic string representation
        data_str = json.dumps(data, sort_keys=True, default=str)
        
        if previous_hash:
            combined = f"{previous_hash}:{data_str}"
        else:
            combined = data_str
        
        return hashlib.sha256(combined.encode('utf-8')).hexdigest()
    
    def add_entry(self, data: Dict) -> str:
        """
        Add an entry to the hash chain.
        TR-LOG-03: Logs must be append-only
        
        Args:
            data: Entry data (will be modified to include hash)
            
        Returns:
            Hash of the new entry
        """
        # Create entry with timestamp if not present
        entry = data.copy()
        if 'timestamp' not in entry:
            entry['timestamp'] = datetime.utcnow().isoformat()
        
        # Compute hash including previous hash
        entry_hash = self._compute_hash(entry, self.last_hash)
        
        # Add hash to entry
        entry['hash'] = entry_hash
        entry['previous_hash'] = self.last_hash
        
        # Append to chain
        self.chain.append(entry)
        self.last_hash = entry_hash
        
        return entry_hash
    
    def verify_chain(self) -> bool:
        """
        Verify integrity of the hash chain.
        
        Returns:
            True if chain is valid, False otherwise
        """
        if not self.chain:
            return True
        
        # Initialize previous_hash to the initial/genesis hash
        # This matches what the first entry's previous_hash field expects
        previous_hash = self.initial_hash
        
        for i, entry in enumerate(self.chain):
            # Check that previous_hash matches
            if entry.get('previous_hash') != previous_hash:
                return False
            
            # Recompute hash
            entry_copy = entry.copy()
            entry_copy.pop('hash', None)
            entry_copy.pop('previous_hash', None)
            
            computed_hash = self._compute_hash(entry_copy, previous_hash)
            
            if entry.get('hash') != computed_hash:
                return False
            
            previous_hash = entry['hash']
        
        return True
    
    def get_last_hash(self) -> Optional[str]:
        """Get the hash of the last entry."""
        return self.last_hash
    
    def get_chain(self) -> List[Dict]:
        """Get all entries in the chain."""
        return self.chain.copy()
    
    def get_entry_by_hash(self, hash_value: str) -> Optional[Dict]:
        """Get an entry by its hash."""
        for entry in self.chain:
            if entry.get('hash') == hash_value:
                return entry
        return None
    
    def restore_chain(self, entries: List[Dict]):
        """
        Restore chain from persisted entries and update last_hash.
        This ensures new entries link to the actual last entry, not initial_hash.
        
        Args:
            entries: List of chain entries to restore
        """
        self.chain = entries.copy()
        
        # Update last_hash to the last entry's hash
        # This is critical for maintaining chain integrity when adding new entries
        if self.chain:
            last_entry = self.chain[-1]
            self.last_hash = last_entry.get('hash', self.initial_hash)
        else:
            # Empty chain, reset to initial hash
            self.last_hash = self.initial_hash


