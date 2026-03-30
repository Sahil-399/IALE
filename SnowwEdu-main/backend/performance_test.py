import time
import requests
from fastapi import FastAPI

app = FastAPI()

@app.get("/performance-test")
async def performance_test():
    """Test API response times"""
    results = {}
    
    # Test course generation
    start_time = time.time()
    try:
        response = requests.post("http://127.0.0.1:8000/generate_course", 
                                json={"topic": "Python Basics", "user_info": {}}, 
                                timeout=60)
        course_time = time.time() - start_time
        results["course_generation"] = {
            "status": "success",
            "time_seconds": round(course_time, 2),
            "response_size": len(response.text)
        }
    except Exception as e:
        course_time = time.time() - start_time
        results["course_generation"] = {
            "status": "failed",
            "time_seconds": round(course_time, 2),
            "error": str(e)
        }
    
    # Test roadmap generation
    start_time = time.time()
    try:
        response = requests.post("http://127.0.0.1:8000/generate_roadmap", 
                                json={"topic": "Web Development"}, 
                                timeout=60)
        roadmap_time = time.time() - start_time
        results["roadmap_generation"] = {
            "status": "success",
            "time_seconds": round(roadmap_time, 2),
            "response_size": len(response.text)
        }
    except Exception as e:
        roadmap_time = time.time() - start_time
        results["roadmap_generation"] = {
            "status": "failed",
            "time_seconds": round(roadmap_time, 2),
            "error": str(e)
        }
    
    return results
