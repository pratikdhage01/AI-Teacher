import pyttsx3

# Initialize the pyttsx3 engine
engine = pyttsx3.init()

# Get available voices and set a softer voice
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)  

# Set properties for softer speech
try:
    engine.setProperty('rate', 140)     # Slightly slower speed for softer effect
    engine.setProperty('volume', 0.7)   # Reduced volume
    
    # Try to set pitch only if supported
    try:
        engine.setProperty('pitch', 50)
    except:
        pass  # Skip if pitch is not supported
        
except Exception as e:
    print(f"Error setting voice properties: {e}")

# Convert text to speech
def speak(text):
    try:
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error during speech: {e}")

# Test with a sample text
speak("Hello, My name is Pratik. "
      "I am a student at VIIT. "
      "I am a student of CSE(AI) branch.")
