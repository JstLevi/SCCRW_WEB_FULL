# Field Scarecrow Bird Detection System - Backend API

## System Overview
Django REST Framework backend for IoT Field Scarecrow Bird Detection System.

## Quick Start
```bash
python -m pip install -r requirements.txt
python manage.py makemigrations
pip install django-cors-headers
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Endpoints
- POST `/api/auth/register/` - Register user
- POST `/api/auth/login/` - Login
- GET `/api/devices/` - List devices
- POST `/api/detections/` - Log bird detection
- GET `/api/activities/` - Activity logs

## Testing with HTTPie
```bash
# Register
http POST http://127.0.0.1:8000/api/auth/register/ username="09123456789" password="test123" full_name="John Doe" province="Bukidnon"

# Login  
http POST http://127.0.0.1:8000/api/auth/login/ username="09123456789" password="test123"

# List Devices (use token from login)
http GET http://127.0.0.1:8000/api/devices/ "Authorization: Bearer YOUR_TOKEN"
```

AppDev: DRF backend for system implemented
