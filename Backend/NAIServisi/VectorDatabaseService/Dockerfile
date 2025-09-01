FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --upgrade -r requirements.txt



# RUN pip install fastapi uvicorn
# RUN pip install pymilvus==1.1.2

COPY metodi.py .
COPY shop.py .
COPY movies.py .
COPY data/ /app/data/
COPY data/ /data/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8000/ || exit 1

RUN pip list

#CMD ["uvicorn", "shop:app", "--host", "127.0.0.1", "--port", "8000"]
CMD ["sh", "-c", "python shop.py && python metodi.py"]