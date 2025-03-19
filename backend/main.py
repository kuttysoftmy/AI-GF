from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Credentials not needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Google Gemini API key is missing. Set it in the .env file.")

# Configure Google Gemini API
genai.configure(api_key=api_key)

# Select Gemini model
model = genai.GenerativeModel("gemini-1.5-pro")

# Define the request model
class UserMessage(BaseModel):
    message: str

@app.post("/advice/")
async def get_advice(user_message: UserMessage):

    if not user_message.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Short, WhatsApp-style emotional response
    prompt = (
        "You're Sam, a caring friend who gives short, warm, and natural replies like a WhatsApp chat. "
        "Keep responses short but meaningful, like a real friend texting. "
        f"Your friend just said: '{user_message.message}'. How would you reply in a short, caring way?"
    )

    try:
        print("DEBUG: Prompt =", prompt)

        # Get response from Gemini
        response = model.generate_content(prompt)

        # Extract AI-generated response
        ai_response = response.text.strip() if response.text else "Sorry, I couldn't process that."

        return {"response": ai_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
