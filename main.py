# main.py
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta

# Cargar variables de entorno
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
JWT_ALGORITHM = "HS256"

if not JWT_SECRET or not TELEGRAM_BOT_TOKEN:
    raise RuntimeError("Faltan variables JWT_SECRET o TELEGRAM_BOT_TOKEN en .env")

app = FastAPI()

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulación de base de datos en memoria
users_db = {}

class TelegramAuth(BaseModel):
    telegram_id: str

def create_access_token(data: dict, expires_delta: int = 60*24):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )

@app.post("/register/telegram")
def register_telegram(auth: TelegramAuth):
    if not auth.telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id requerido")
    if auth.telegram_id in users_db:
        raise HTTPException(status_code=400, detail="Usuario ya registrado")
    users_db[auth.telegram_id] = {}
    token = create_access_token({"telegram_id": auth.telegram_id})
    return {"access_token": token}

@app.post("/login/telegram")
def login_telegram(auth: TelegramAuth):
    if not auth.telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id requerido")
    if auth.telegram_id not in users_db:
        raise HTTPException(status_code=401, detail="Usuario no registrado")
    token = create_access_token({"telegram_id": auth.telegram_id})
    return {"access_token": token}

@app.get("/health")
def health_check():
    return {"status": "ok"}