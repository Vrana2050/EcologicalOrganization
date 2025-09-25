# ---- 1) Base image ----
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/home/appuser/.local/bin:${PATH}"

# Sistem paketi (ako koristiš psycopg2-binary, libpq nije obavezan, ali je koristan alat)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates netcat-traditional \
 && rm -rf /var/lib/apt/lists/*

# Kreiraj ne-root korisnika
RUN useradd -ms /bin/bash appuser
WORKDIR /app
USER appuser

# ---- 2) Builder: instalacija dependencija ----
FROM base AS builder
# Kopiramo samo requirements da iskoristimo keš
COPY --chown=appuser:appuser requirements.txt /app/requirements.txt
RUN pip install --user -r /app/requirements.txt

# ---- 3) Runtime: samo ono što treba za rad ----
FROM base AS runtime
# Kopiraj instalirane pakete iz builder-a
COPY --from=builder /home/appuser/.local /home/appuser/.local

# Kopiraj aplikaciju
COPY --chown=appuser:appuser . /app

# (Opcionalno) ako imaš .env u containteru i želiš da se učita, to radi tvoja app logika.
# EXPOSE je samo dokumentacija; port mapira docker-compose
EXPOSE 8007

# Healthcheck je bolje staviti u docker-compose.yml
# HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://localhost:8007/healthy || exit 1

# Promeni ovo ako ti je drugačiji modul ili port:
# main.py sadrži: app = FastAPI()
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8007"]
