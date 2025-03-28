# Personal Voice Assistant

A web-based voice assistant that responds to personal questions based on your profile. This application uses the Web Speech API for speech recognition and synthesis, and OpenRouter API for generating personalized responses.

## Live Demo

You can try the live demo here: [Personal Voice Assistant Demo](https://your-demo-url.com)

## Features

- Voice input and output
- Text input option for environments where voice isn't available
- Personalized responses to questions about your life, strengths, growth areas, etc.
- Simple, user-friendly interface
- No complex installation required

## Setup Instructions

### Option 1: Use the Live Demo

1. Visit the [live demo](https://your-demo-url.com)
2. The application comes pre-configured with an API key, but you can replace it with your own from [OpenRouter](https://openrouter.ai/) if needed
3. Start interacting with the voice assistant

### Option 2: Run Locally

1. Clone this repository:
   ```
   git clone https://github.com/vedantgit1/personal-voice-assistant.git
   ```

2. Navigate to the project directory:
   ```
   cd personal-voice-assistant
   ```

3. Open the `index.html` file in your web browser:
   - You can double-click the file to open it
   - Or use a local server like Python's `http.server`:
     ```
     python -m http.server
     ```
     Then visit `http://localhost:8000` in your browser

4. **Important: You need to provide your own API key**
   - Get an API key from [OpenRouter](https://openrouter.ai/)
   - Enter your API key in the application's interface
   - Your API key will be stored in your browser's localStorage

5. Start interacting with the voice assistant

## How to Use

1. **Enter your OpenRouter API key** when prompted
   - You can get an API key from [OpenRouter](https://openrouter.ai/)
   - Your API key will be stored in your browser's localStorage
   - **IMPORTANT: Never commit your API key to GitHub or share it publicly**
2. Click the "Start Listening" button to begin voice recognition
3. Ask a question using your voice
4. The assistant will respond both in text and with voice
5. Alternatively, you can type your question in the text input field and click "Send"

## Example Questions

- What should we know about your life story in a few sentences?
- What's your #1 superpower?
- What are the top 3 areas you'd like to grow in?
- What misconception do your coworkers have about you?
- How do you push your boundaries and limits?

## Technical Details

This application uses:

- **Web Speech API**: For speech recognition and synthesis
- **OpenRouter API**: To access advanced language models
  - **DeepSeek R1 (Free)**: Primary model used for responses
  - Automatic fallback to other models if needed
- **HTML/CSS/JavaScript**: For the web interface
- **LocalStorage**: To save your API key between sessions

## Browser Compatibility

The Web Speech API is supported in most modern browsers, including:
- Chrome
- Edge
- Safari
- Firefox

For the best experience, we recommend using Google Chrome.

## Troubleshooting

- **Speech recognition not working**: Make sure you've granted microphone permissions to the website
- **API errors**: Verify that your OpenRouter API key is correct and has sufficient credits
- **Voice output issues**: Some browsers may have limitations with speech synthesis. Try refreshing the page or using a different browser

## Privacy Note

Your API key is stored in your browser's local storage and is only used to make requests to the OpenRouter API. No data is sent to any other servers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.