import hashlib
from bs4 import BeautifulSoup
import requests
from typing import Dict, Any, List, Optional
from loguru import logger

class ContentChecker:
    @staticmethod
    def get_content_hash(html: str) -> str:
        """
        Generates a SHA-256 hash of the HTML content.
        """
        return hashlib.sha256(html.encode('utf-8')).hexdigest()

    @staticmethod
    def extract_text(html: str) -> str:
        """
        Extracts clean text from HTML using BeautifulSoup.
        """
        soup = BeautifulSoup(html, 'html.parser')
        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing whitespace
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        return '\n'.join(chunk for chunk in chunks if chunk)

    @staticmethod
    def find_keywords(text: str, keywords: List[str]) -> Dict[str, bool]:
        """
        Checks if specific keywords exist in the text.
        """
        return {kw: kw.lower() in text.lower() for kw in keywords}

    @classmethod
    def analyze_page(cls, url: str, target_keywords: Optional[List[str]] = None) -> Dict[str, Any]:
        try:
            response = requests.get(url, timeout=10)
            html = response.text
            text = cls.extract_text(html)
            
            content_hash = cls.get_content_hash(html)
            keyword_matches = cls.find_keywords(text, target_keywords or [])
            
            return {
                "success": True,
                "content_hash": content_hash,
                "keyword_matches": keyword_matches,
                "text_length": len(text)
            }
        except Exception as e:
            logger.error(f"Content analysis failed for {url}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
