.PHONY: dev migrate createsuperuser seed install-backend install-frontend

dev:
	docker compose up

dev-build:
	docker compose up --build

migrate:
	docker compose exec backend python manage.py migrate

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

seed:
	docker compose exec backend python manage.py seed

shell:
	docker compose exec backend python manage.py shell

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

local-backend:
	cd backend && python manage.py runserver

local-frontend:
	cd frontend && npm run dev
