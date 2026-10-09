import json
import os
import time
import random
import signal
import arrow
import requests
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

SERPAPI_URL = 'https://serpapi.com/search.json'

def _serpapi_get(api_key, **params):
    resp = requests.get(SERPAPI_URL, params={'engine': 'google_scholar_author', 'api_key': api_key, **params}, timeout=60)
    data = resp.json()
    if resp.status_code != 200 or 'error' in data:
        raise RuntimeError(f"SerpApi error ({resp.status_code}): {data.get('error', resp.text[:200])}")
    return data

def fetch_publications_serpapi(author_id, api_key, existing_data):
    """Fetch publications through SerpApi, which isn't blocked on CI runners.

    The article list (titles, venues, citation counts) costs one request. Full
    authors, publication date and link need one request per paper, so they are
    reused from existing data and only fetched for papers not seen before.
    """
    cached_by_id = {p['scholar_id']: p for p in existing_data if p.get('scholar_id')}
    cached_by_title = {p['title'].strip().lower(): p for p in existing_data}

    articles = []
    start = 0
    while True:
        data = _serpapi_get(api_key, author_id=author_id, num=100, start=start)
        page = data.get('articles', [])
        articles.extend(page)
        if len(page) < 100:
            break
        start += 100
    print(f"SerpApi returned {len(articles)} articles")

    publications = []
    for article in articles:
        scholar_id = article.get('citation_id')
        title = article.get('title', 'Untitled')
        cached = cached_by_id.get(scholar_id) or cached_by_title.get(title.strip().lower())

        if cached and cached.get('author') and cached.get('pub_date'):
            author_str, pub_date, url = cached['author'], cached['pub_date'], cached.get('url')
        else:
            print(f"Fetching details for new publication: {title}")
            citation = _serpapi_get(api_key, view_op='view_citation', citation_id=scholar_id).get('citation', {})
            authors = [a.strip() for a in citation.get('authors', article.get('authors', '')).split(',') if a.strip()]
            author_str = ' and '.join(authors) or 'Unknown Author'
            pub_date = normalize_pub_date(citation.get('publication_date'))
            url = citation.get('link') or article.get('link')

        year = article.get('year')
        publications.append({
            'title': title,
            'year': int(year) if str(year).isdigit() else (int(pub_date[:4]) if pub_date else 'N/A'),
            'pub_date': pub_date,
            'citation_count': (article.get('cited_by') or {}).get('value') or 0,
            'venue': article.get('publication', ''),
            'author': author_str,
            'url': url,
            'scholar_id': scholar_id,
        })

    publications.sort(key=lambda x: x.get('citation_count', 0), reverse=True)
    return publications

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
                    'url': pub.get('pub_url'),
                    'scholar_id': pub.get('author_pub_id'),
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
    
    api_key = os.environ.get('SERPAPI_KEY')
    if api_key:
        print("Using SerpApi")
        try:
            pubs = fetch_publications_serpapi(AUTHOR_ID, api_key, existing_data or [])
        except Exception as e:
            # Fail loudly: this means a bad key, exhausted quota or an API change
            print(f"✗ SerpApi fetch failed: {e}")
            exit(1)
        if not pubs:
            print("✗ SerpApi returned no publications")
            exit(1)
        with open(output_file, 'w') as f:
            json.dump(pubs, f, indent=2)
        print(f"✓ Successfully saved {len(pubs)} publications to {output_file}")
        return

    print("SERPAPI_KEY not set, scraping Google Scholar directly")
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
