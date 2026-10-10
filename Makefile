.PHONY: help install ingest test e2e run-backend run-frontend docker-up docker-down clean

help:
	@echo "Portfolix Development Commands:"
	@echo "  make install       - Install backend and frontend dependencies"
	@echo "  make ingest        - Run the idempotent stock data ETL pipeline"
	@echo "  make test          - Run backend Pytest test suite"
	@echo "  make e2e           - Run end-to-end integration test suite"
	@echo "  make run-backend   - Start FastAPI development server"
	@echo "  make run-frontend  - Start Vite React frontend development server"
	@echo "  make docker-up     - Build and run production stack with Docker Compose"
	@echo "  make docker-down   - Stop Docker Compose stack"

install:
	uv pip install -e .
	cd frontend && npm install

ingest:
	uv run python scripts/ingest_csv.py

test:
	uv run pytest -v tests/

e2e:
	uv run python scripts/verify_e2e.py

run-backend:
	uv run uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down
