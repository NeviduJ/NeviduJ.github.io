import json
import os
import time
import random
import signal
import arrow
from scholarly import scholarly, ProxyGenerator
import scholarly.publication_parser as publication_parser

# Google Scholar often throttles CI runners, and scholarly then retries silently
# for a long time. Give up after this many seconds and keep the existing data.
FETCH_TIMEOUT_SECONDS = 5 * 60

# Subclass BaseException so scholarly's internal `except Exception` retry
# handlers can't swallow it
class FetchTimeout(BaseException):
    pass

def _on_fetch_timeout(signum, frame):
    raise FetchTimeout(f"Timed out after {FETCH_TIMEOUT_SECONDS} seconds (likely blocked by Google Scholar)")

# scholarly parses the full "Publication date" (e.g. 2026/3/15) but only keeps
# the year. Record the raw value so publications can be ordered by month too.
_last_pub_date = {}

class _ArrowRecorder:
    def __getattr__(self, name):
        return getattr(arrow, name)

    @staticmethod
    def get(*args, **kwargs):
        if args and isinstance(args[0], str):
            _last_pub_date['value'] = args[0]
        return arrow.get(*args, **kwargs)

publication_parser.arrow = _ArrowRecorder()

def normalize_pub_date(raw):
    """Convert '2026/3/5' -> '2026-03-05', '2026/3' -> '2026-03', '2026' -> '2026'"""
    if not raw:
        return None
    try:
        parts = [int(p) for p in raw.strip().split('/')]
    except ValueError:
        return None
    return '-'.join([f"{parts[0]:04d}"] + [f"{p:02d}" for p in parts[1:3]])

def setup_proxy():
    """Setup proxy for scholarly to avoid blocking"""
    try:
        pg = ProxyGenerator()
        # Try to use Luminati proxy if available, otherwise use ScraperAPI
        # Note: Free proxies often don't work well with scholarly
        # For now, we'll skip proxy and rely on retry logic
        # Uncomment and configure if you have a proxy service:
        # pg.ScraperAPI('your_api_key')
        # scholarly.use_proxy(pg)
        print("Running without proxy - relying on retry logic and delays")
        return False
    except Exception as e:
        print(f"Warning: Could not setup proxy: {e}")
        print("Continuing without proxy...")
        return False

def fetch_publications_with_retry(author_id, max_retries=5):
    """Fetch publications with retry logic and exponential backoff"""
    
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}/{max_retries}: Fetching publications for author ID: {author_id}")
            
            # Add random delay to avoid rate limiting (2-5 seconds)
            if attempt > 0:
                delay = (2 ** attempt) + random.uniform(1, 3)
                print(f"Waiting {delay:.1f} seconds before retry...")
                time.sleep(delay)
            
            # Search for author
            author = scholarly.search_author_id(author_id)
            time.sleep(random.uniform(1, 2))  # Random delay between requests
            
            # Fill author details
            scholarly.fill(author, sections=['publications'])
            
            publications = []
            for i, pub in enumerate(author['publications']):
                # Add small delay between publication fetches
                if i > 0 and i % 5 == 0:
                    time.sleep(random.uniform(1, 2))
                
                # Fill publication details to get complete information including authors
                _last_pub_date.clear()
                try:
                    scholarly.fill(pub)
                except Exception as e:
                    print(f"Warning: Could not fill details for publication: {pub['bib'].get('title', 'Unknown')}")
                    print(f"Error: {e}")
                
                # Format author names properly
                author_list = pub['bib'].get('author', '')
                if isinstance(author_list, list):
                    author_str = ', '.join(author_list)
                else:
                    author_str = author_list if author_list else 'Unknown Author'
                
                pub_data = {
                    'title': pub['bib'].get('title', 'Untitled'),
                    'year': pub['bib'].get('pub_year', 'N/A'),
                    'pub_date': normalize_pub_date(_last_pub_date.get('value')),
                    'citation_count': pub.get('num_citations', 0),
                    'venue': pub['bib'].get('venue') or pub['bib'].get('journal') or pub['bib'].get('citation', ''),
                    'author': author_str,
                    'url': pub.get('pub_url')
                }
                publications.append(pub_data)
            
            # Sort by citation count descending
            publications.sort(key=lambda x: x.get('citation_count', 0), reverse=True)
            
            print(f"Successfully fetched {len(publications)} publications")
            return publications
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                print("All retry attempts exhausted")
                raise
            # Setup proxy again on retry if first attempt failed
            if attempt == 1:
                setup_proxy()
    
    return []

def main():
    AUTHOR_ID = '2pDm_0UAAAAJ'
    output_file = os.path.join(os.path.dirname(__file__), '../data/publications.json')
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Check if existing file exists for fallback
    existing_data = None
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r') as f:
                existing_data = json.load(f)
            print(f"Found existing data with {len(existing_data)} publications")
        except Exception as e:
            print(f"Could not read existing data: {e}")
    
    # Setup proxy
    setup_proxy()
    
    signal.signal(signal.SIGALRM, _on_fetch_timeout)
    signal.alarm(FETCH_TIMEOUT_SECONDS)
    try:
        pubs = fetch_publications_with_retry(AUTHOR_ID)
        signal.alarm(0)
        
        if pubs:
            with open(output_file, 'w') as f:
                json.dump(pubs, f, indent=2)
            print(f"✓ Successfully saved {len(pubs)} publications to {output_file}")
        else:
            print("No publications fetched")
            if existing_data:
                print("Keeping existing data")
            exit(1)
            
    except (Exception, FetchTimeout) as e:
        signal.alarm(0)
        print(f"✗ Error fetching publications: {e}")
        
        # Fallback: keep existing data if available
        if existing_data:
            print(f"Keeping existing data with {len(existing_data)} publications")
            print("Note: Data was not updated but workflow will continue")
            exit(0)  # Exit successfully to not fail the workflow
        else:
            print("No existing data to fall back on")
            exit(1)

if __name__ == "__main__":
    main()
