"""Build the local scholarship ChromaDB index from the structured seed records."""
import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.data.scholarship_seed import SAMPLE_SCHOLARSHIPS
from app.rag.document_loader import load_from_pdf, load_from_url
from app.rag.pipeline import run_full_ingestion

parser = argparse.ArgumentParser()
parser.add_argument("--force", action="store_true", help="Replace the existing local index")
parser.add_argument("--pdf-dir", type=Path, help="Also index PDF files from this directory; include a scheme ID in each filename when possible")
parser.add_argument("--include-web", action="store_true", help="Fetch and index each scheme's official website")
args = parser.parse_args()
extra_docs = []
if args.pdf_dir:
    for path in args.pdf_dir.glob("*.pdf"):
        scheme = next((item for item in SAMPLE_SCHOLARSHIPS if item.id in path.stem), None)
        extra_docs.extend(load_from_pdf(str(path), scheme.id if scheme else f"external_{path.stem}",
                                        scheme.name if scheme else path.stem.replace("_", " ")))
if args.include_web:
    seen = set()
    for scheme in SAMPLE_SCHOLARSHIPS:
        if scheme.official_website in seen: continue
        seen.add(scheme.official_website)
        extra_docs.extend(load_from_url(scheme.official_website, scheme.id, scheme.name))
print(f"Indexed {run_full_ingestion(SAMPLE_SCHOLARSHIPS, force_reindex=args.force, extra_docs=extra_docs)} chunks")
