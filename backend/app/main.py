import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, users, academic, timetable, attendance, evaluations, campus, notifications, websockets, intelligence, engineering

# Setup basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="CampusOS API", version="1.0.0")

from starlette.middleware.base import BaseHTTPMiddleware
from .core.database import SessionLocal
from .models.engineering import AuditLog
from jose import jwt
from .core.security import SECRET_KEY, ALGORITHM

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Log critical actions (mutations)
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            user_id = None
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                    sub = payload.get("sub")
                    if sub:
                        user_id = int(sub)
                except Exception:
                    pass
            
            # Avoid logging login failures as NULL users unless needed, but it's fine.
            # Skip if it's just an OPTIONS request, though we already filtered by method.
            db = SessionLocal()
            try:
                ip = request.client.host if request.client else None
                action_name = f"{request.method} {request.url.path}"
                log = AuditLog(
                    user_id=user_id,
                    action=action_name,
                    resource=request.url.path,
                    ip_address=ip
                )
                db.add(log)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to write audit log: {e}")
            finally:
                db.close()
                
        return response

app.add_middleware(AuditMiddleware)


# Central error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(academic.router, prefix="/api/v1/academic", tags=["academic"])
app.include_router(timetable.router, prefix="/api/v1/timetable", tags=["timetable"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["attendance"])
app.include_router(evaluations.router, prefix="/api/v1/evaluations", tags=["evaluations"])
app.include_router(campus.router, prefix="/api/v1/campus", tags=["campus"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(intelligence.router, prefix="/api/v1/intelligence", tags=["intelligence"])
app.include_router(engineering.router, prefix="/api/v1/engineering", tags=["engineering"])
app.include_router(websockets.router, tags=["websockets"])

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://campus-os-web-wgiw.vercel.app",
        "https://campus-os-chi-eight.vercel.app",
        "https://campus-os.vercel.app",
        "https://resosync.amitdevx.tech",
        "http://resosync.amitdevx.tech"
    ],
    allow_origin_regex=r"https://campus-os-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CampusOS API"}

@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "ok"}

