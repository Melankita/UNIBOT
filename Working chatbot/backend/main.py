import sys
import asyncio
from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import json
import logging
import traceback
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
import torch
device = torch.device("cpu")
from LiveNotification_worker import fetch_bulletins
from chat_response_worker import chat_with_bot, perform_web_search, save_feedback, save_user_credentials
from pdf_upload_worker import handle_pdf_upload, get_study_response  # ✅ IMPORTED HERE

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login")
def login(mobile: str = Form(...), password: str = Form(...)):
    try:
        result = subprocess.run(
            ["python", "login_worker.py", mobile, password],
            capture_output=True,
            text=True,
            timeout=180
        )
        output = result.stdout.strip()

        if "success" in output.lower():
            save_user_credentials(mobile, password)
            return {"success": True}
        elif "invalid credentials" in output.lower():
            raise HTTPException(status_code=401, detail="Invalid credentials")
        else:
            raise HTTPException(status_code=500, detail=output or "Login failed")

    except subprocess.TimeoutExpired:
        logger.error("Login timed out")
        raise HTTPException(status_code=504, detail="Login timed out")
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/attendance")
def get_attendance(mobile: str = Form(...), password: str = Form(...)):
    return _run_worker("attendance_worker.py", mobile, password)

@app.post("/results")
def get_results(mobile: str = Form(...), password: str = Form(...)):
    return _run_worker("result_worker.py", mobile, password)

@app.post("/timetable")
def get_timetable(mobile: str = Form(...), password: str = Form(...)):
    return _run_worker("timetable_worker.py", mobile, password)

@app.post("/chat")
async def chat_endpoint(message: str = Form(...), include_search: bool = Form(False)):
    try:
        reply = chat_with_bot(message, include_search=include_search)
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/upload-pdf")
async def upload_pdf_endpoint(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        contents = await file.read()
        result = handle_pdf_upload(file.filename, contents)
        if result == "success":
            return {"message": f"{file.filename} uploaded successfully"}
        elif result.startswith("error:"):
            raise HTTPException(status_code=500, detail=result[6:])
        else:
            raise HTTPException(status_code=500, detail="Unknown error")
    except Exception as e:
        logger.error(f"PDF upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")

@app.post("/query-study")
async def query_study_endpoint(prompt: str = Form(...)):
    try:
        answer = get_study_response(prompt)  # ✅ Uses uploaded PDFs only
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Study query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Study query failed: {str(e)}")

@app.post("/api/search")
def search(query: str = Form(...)):
    try:
        results = perform_web_search(query)
        return {"status": "success", "results": results}
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

class FeedbackRequest(BaseModel):
    user_query: str
    ai_response: str
    user_feedback: str

@app.post("/feedback")
async def feedback_endpoint(payload: FeedbackRequest):
    try:
        save_feedback(payload.user_query, payload.ai_response, payload.user_feedback)
        return {"status": "success", "message": "Feedback saved successfully"}
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Feedback error: {str(e)}")

@app.get("/notifications")
def get_notifications():
    try:
        result = fetch_bulletins()
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return {"status": "success", "notifications": result["bulletins"]}
    except Exception as e:
        logger.error(f"Notifications error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Notifications fetch failed: {str(e)}")

def _run_worker(script: str, mobile: str, password: str):
    if not os.path.isfile(script):
        logger.error(f"Worker script {script} not found")
        raise HTTPException(status_code=500, detail=f"Worker script {script} not found")

    try:
        result = subprocess.run(
            ["python", script, mobile, password],
            capture_output=True,
            text=True,
            timeout=120
        )
        output = result.stdout.strip()
        error_output = result.stderr.strip()

        if error_output:
            logger.error(f"Worker {script} stderr: {error_output}")
            raise HTTPException(status_code=500, detail=f"Worker script error: {error_output}")

        if "Invalid credentials" in output:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        try:
            parsed_data = json.loads(output)
            return {"data": parsed_data}
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON response from {script}: stdout={output}, stderr={error_output}")
            raise HTTPException(status_code=500, detail=f"Invalid JSON response from {script}: {output}")
    except subprocess.TimeoutExpired:
        logger.error(f"Worker {script} timed out")
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error(f"Worker {script} error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Worker error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
