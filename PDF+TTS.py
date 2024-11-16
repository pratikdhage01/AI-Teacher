import pyttsx3
import PyPDF2

def read_pdf(pdf_path):
    try:
        # Open the PDF file
        with open(pdf_path, 'rb') as file:
            # Create a PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Initialize text variable
            full_text = ""
            
            # Read through all pages
            for page_num in range(len(pdf_reader.pages)):
                # Extract text from page
                page = pdf_reader.pages[page_num]
                full_text += page.extract_text()
                
            return full_text
            
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

# Initialize the pyttsx3 engine
engine = pyttsx3.init()

# Get available voices and set a softer voice
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)  

# Set properties for softer speech
try:
    engine.setProperty('rate', 140)     # Slightly slower speed for softer effect
    engine.setProperty('volume', 0.7)   # Reduced volume
except Exception as e:
    print(f"Error setting voice properties: {e}")

def speak(text):
    try:
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error during speech: {e}")

def pdf_to_speech(pdf_path):
    # Read the PDF
    text = read_pdf(pdf_path)
    
    if text:
        # Convert text to speech
        speak(text)
    else:
        print("Failed to read PDF file")

# Example usage
if __name__ == "__main__":
    pdf_path = "test.pdf"  # Replace with your PDF file path
    pdf_to_speech(pdf_path)
