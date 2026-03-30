# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests, os, json
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

load_dotenv()
app = FastAPI()

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"  # Faster model for quick responses
CACHE = {}  # Simple in-memory cache

def extract_json_substring(s: str):
    start = s.find("{")
    if start == -1:
        return None
    stack = 0
    for i in range(start, len(s)):
        if s[i] == "{":
            stack += 1
        elif s[i] == "}":
            stack -= 1
            if stack == 0:
                return s[start:i+1]
    return None

@app.post("/generate_course")
async def generate_course(data: dict):
    try:
        topic = data.get("topic", "").strip()
        user_info = data.get("user_info", {})
        if not topic:
            raise HTTPException(status_code=400, detail="Missing 'topic' in request body")

        # Create cache key from topic and user preferences
        skill_level = user_info.get("skill_level", "Beginner")
        learning_style = user_info.get("learning_style", "Mixed")
        time_commitment = user_info.get("time_commitment", "1 hour/day")
        cache_key = f"course_{topic}_{skill_level}_{learning_style}_{time_commitment}"
        
        # Check cache first
        if cache_key in CACHE:
            print(f" Cache hit for {cache_key}")
            return CACHE[cache_key]
        
        print(f" Generating new course for {cache_key}")

        prompt = f"""
You are a professional course designer. Create a COMPLETE learning course for "{topic}" for {skill_level} learners with {learning_style} learning style and {time_commitment} daily study.

Requirements:
1. 4-6 modules, each with 3-6 lessons.
2. Each lesson must include:
   - Explanation of concept in simple language.
   - 2-3 code examples demonstrating different approaches.
   - Exercises of increasing difficulty.
   - Quiz questions with multiple-choice options, correct answer, and hint.
3. Each module has a mini project applying all lessons in that module.
4. End the course with a capstone project integrating all modules.
5. Provide recommended duration for each module and lesson.
6. Include learning resources (links, videos, docs) per module.
7. Return ONLY valid JSON in the exact structure:

{{
  "course_title": "string",
  "overview": "string",
  "total_duration": "string",
  "modules": [
    {{
      "module_title": "string",
      "duration": "string",
      "objective": "string",
      "lessons": [
        {{
          "title": "string",
          "explanation": "string",
          "code_examples": ["string"],
          "exercises": ["string"],
          "quiz": [{{"question":"string","options":["string"],"answer":"string","hint":"string"}}]
        }}
      ],
      "mini_project": {{
        "title": "string",
        "description": "string",
        "steps": ["string"]
      }},
      "resources": ["string"]
    }}
  ],
  "capstone_project": {{
    "title": "string",
    "description": "string",
    "steps": ["string"]
  }},
  "tips": ["string"]
}}
        """

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You must output valid JSON only. No explanations, no markdown, pure JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 6000,  # Reduced from 12000 for faster response
        }

        res = requests.post(CHAT_COMPLETIONS_URL, headers=headers, json=payload, timeout=45)  # Reduced from 120s
        res.raise_for_status()
        resp_json = res.json()

        content = resp_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            raise HTTPException(status_code=500, detail="Empty response from LLM")

        # Parse JSON
        parsed = None
        try:
            parsed = json.loads(content)
        except Exception:
            js = extract_json_substring(content)
            if js:
                try:
                    parsed = json.loads(js)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"JSON extraction failed: {str(e)}")
            else:
                raise HTTPException(status_code=500, detail="No valid JSON found in response")

        result = {"structured": parsed, "raw": content}
        
        # Cache the result
        CACHE[cache_key] = result
        print(f" Cached result for {cache_key}")
        
        return result

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_roadmap")
async def generate_roadmap(data: dict):
    try:
        topic = data.get("topic", "").strip()
        if not topic:
            raise HTTPException(status_code=400, detail="Missing 'topic' in request body")

        # Create cache key
        cache_key = f"roadmap_{topic}"
        
        # Check cache first
        if cache_key in CACHE:
            print(f" Cache hit for {cache_key}")
            return CACHE[cache_key]
        
        print(f" Generating new roadmap for {cache_key}")

        prompt = f"""
You are an AI mentor. Generate a clear learning ROADMAP for mastering "{topic}".
Structure it week-by-week with milestones, resources, and mini goals.

Example format:
{{
  "title": "string",
  "overview": "string",
  "weeks": [
    {{
      "week_number": 1,
      "focus_area": "string",
      "topics": ["string"],
      "resources": ["string"],
      "goal": "string"
    }}
  ]
}}
        """

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "Output ONLY valid JSON — no markdown, no explanation."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 2000,  # Reduced from 4000 for faster response
        }

        res = requests.post(CHAT_COMPLETIONS_URL, headers=headers, json=payload, timeout=30)  # Reduced from 90s
        res.raise_for_status()
        resp_json = res.json()
        content = resp_json.get("choices", [{}])[0].get("message", {}).get("content", "")

        js = extract_json_substring(content)
        parsed = json.loads(js) if js else {}

        result = {"structured": parsed, "raw": content}
        
        # Cache the result
        CACHE[cache_key] = result
        print(f" Cached result for {cache_key}")
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 500:-internal server error
# 400:-

# Progress tracking models
class ProgressUpdate(BaseModel):
    saved_item_id: str
    lesson_index: int
    module_index: int
    is_completed: bool

class CourseProgress(BaseModel):
    saved_item_id: str
    completed_lessons: int
    total_lessons: int
    completed_modules: int
    total_modules: int
    progress_percentage: int
    is_completed: bool

# Progress tracking endpoints
@app.post("/update_lesson_progress")
async def update_lesson_progress(progress: ProgressUpdate):
    """
    Update individual lesson completion status
    This would typically connect to a database in a real application
    For now, we'll return a success response
    """
    try:
        # In a real implementation, this would update your database
        # For now, we'll simulate the update
        
        return {
            "success": True,
            "message": "Lesson progress updated successfully",
            "data": {
                "saved_item_id": progress.saved_item_id,
                "lesson_index": progress.lesson_index,
                "module_index": progress.module_index,
                "is_completed": progress.is_completed,
                "updated_at": "2024-01-01T00:00:00Z"  # Placeholder
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update_course_progress")
async def update_course_progress(course_progress: CourseProgress):
    """
    Update overall course progress
    This would typically connect to a database in a real application
    """
    try:
        # In a real implementation, this would update your database
        return {
            "success": True,
            "message": "Course progress updated successfully",
            "data": course_progress.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_course_progress/{saved_item_id}")
async def get_course_progress(saved_item_id: str):
    """
    Get progress details for a specific course
    This would typically query your database
    """
    try:
        # In a real implementation, this would query your database
        # For now, we'll return mock data
        return {
            "success": True,
            "data": {
                "saved_item_id": saved_item_id,
                "completed_lessons": 0,
                "total_lessons": 20,
                "completed_modules": 0,
                "total_modules": 5,
                "progress_percentage": 0,
                "is_completed": False,
                "lesson_progress": []  # Array of individual lesson progress
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))