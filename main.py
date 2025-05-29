from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
from datetime import datetime, timedelta

# Configuración
SECRET_KEY = "CAMBIA_ESTO_POR_UNA_CLAVE_SECRETA"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 días

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simulación de base de datos en memoria
fake_db = {}

class User(BaseModel):
    telegram_id: str
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        telegram_id: str = payload.get("sub")
        if telegram_id is None or telegram_id not in fake_db:
            raise credentials_exception
        return fake_db[telegram_id]
    except JWTError:
        raise credentials_exception

@app.post("/register/telegram", response_model=Token)
def register_telegram(user: User):
    if user.telegram_id in fake_db:
        raise HTTPException(status_code=400, detail="Usuario ya registrado")
    fake_db[user.telegram_id] = user.dict()
    access_token = create_access_token(data={"sub": user.telegram_id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login/telegram", response_model=Token)
def login_telegram(user: User):
    if user.telegram_id not in fake_db:
        raise HTTPException(status_code=400, detail="Usuario no registrado")
    access_token = create_access_token(data={"sub": user.telegram_id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user