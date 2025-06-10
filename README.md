# Sistema de Control de Judo

Sistema web para la gestión y control de competencias de judo, desarrollado con React.js y Django.

## Características

- Gestión de usuarios y competidores
- Control de competiciones y torneos
- Sistema de combates en tiempo real
- Generación de estadísticas y reportes
- Interfaz intuitiva y responsive

## Tecnologías

### Frontend
- React.js
- Bootstrap/Material-UI
- Axios para API calls

### Backend
- Django
- Django REST Framework
- SQLite/PostgreSQL
- JWT Authentication

## Instalación

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver