# api/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Expose Flask default port
EXPOSE 5000

# Let Flask bind to 0.0.0.0 so it’s reachable from other containers
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_APP=app.py  
CMD ["flask", "run"]
# CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]