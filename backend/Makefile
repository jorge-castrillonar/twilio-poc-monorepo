.PHONY: build up down logs clean

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v
	docker system prune -f

status:
	docker compose ps
	docker compose images

test-core:
	curl -X POST http://localhost:8081/api/v1/files/upload-url \
		-H "Content-Type: application/json" \
		-d '{"fileName":"test.txt","contentType":"text/plain"}'

test-health:
	curl http://localhost:8081/actuator/health
	curl http://localhost:8080/actuator/health