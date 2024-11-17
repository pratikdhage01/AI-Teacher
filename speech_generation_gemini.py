import google.generativeai as genai
from tkinter import filedialog, Tk
from PyPDF2 import PdfReader
from pptx import Presentation
import os
import pyttsx3

genai.configure(api_key="AIzaSyBbMqcZP9FSOTB7yLCNkVXMu7XpJ5JefEs")

engine = pyttsx3.init()
engine.setProperty('rate', 140)     
engine.setProperty('volume', 0.7)   
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)  


def read_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            full_text = ""
            for page in pdf_reader.pages:
                full_text += page.extract_text()
            return full_text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None


def read_ppt(file_path):
    try:
        prs = Presentation(file_path)
        full_text = ""
        for slide in prs.slides:
            full_text += "\nNew Slide:\n"
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    full_text += shape.text + "\n"
        return full_text.strip()
    except Exception as e:
        print(f"Error reading PPT: {e}")
        return None

def summarize_with_gemini_ai(text):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"Summarize the following text:\n{text}")
        return response.text.strip()
    except Exception as e:
        print(f"Error with Gemini AI API: {e}")
        return None

def speak(text):
    try:
        print("Speaking the summary...")
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error during speech generation: {e}")

def process_file(file_path):
    _, extension = os.path.splitext(file_path.lower())
    text = None

    if extension == '.pdf':
        text = read_pdf(file_path)
    elif extension in ['.ppt', '.pptx']:
        text = read_ppt(file_path)
    else:
        print("Unsupported file type.")
        return

    if text:
        print("Sending text to Gemini AI for summarization...")
        summary = summarize_with_gemini_ai(text)
        if summary:
            print("Summary:")
            print(summary)
            # Generate speech from the summary
            speak(summary)
        else:
            print("Failed to get a summary from Gemini AI.")
    else:
        print("No text extracted from the file.")

if __name__ == "__main__":
    root = Tk()
    root.withdraw()

    file_path = filedialog.askopenfilename(
        title="Select a file",
        filetypes=[("Supported files", "*.pdf;*.ppt;*.pptx"),
                   ("PDF files", "*.pdf"),
                   ("PowerPoint files", "*.ppt;*.pptx")]
    )

    if file_path:
        print(f"Processing file: {file_path}")
        process_file(file_path)
    else:
        print("No file selected.")
