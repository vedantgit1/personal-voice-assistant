document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const stopSpeakingBtn = document.getElementById('stop-speaking-btn');
    const testApiBtn = document.getElementById('test-api-btn');
    const statusDiv = document.getElementById('status');
    const chatMessages = document.getElementById('chat-messages');
    const textQuestion = document.getElementById('text-question');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const showApiFormBtn = document.getElementById('show-api-form');
    const apiKeyContainer = document.getElementById('api-key-container');

    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
    } else {
        statusDiv.textContent = 'Speech recognition not supported in this browser.';
        startBtn.disabled = true;
    }

    // Speech synthesis setup
    const synth = window.speechSynthesis;

    let apiKey = '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';

    // Check if API key exists in localStorage
    if (localStorage.getItem('openrouter_api_key')) {
        apiKey = localStorage.getItem('openrouter_api_key');
        apiKeyInput.value = apiKey;
        apiKeyContainer.style.display = 'none'; // Hide API key input if we already have a key
    } else {
        // Show API key input form and disable assistant functionality
        startBtn.disabled = true;
        sendBtn.disabled = true;
        statusDiv.textContent = 'Please enter your OpenRouter API key to begin';
    }

    // Save API key when button is clicked
    saveApiKeyBtn.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            apiKey = newApiKey;
            localStorage.setItem('openrouter_api_key', apiKey);
            apiKeyContainer.style.display = 'none';
            startBtn.disabled = false;
            sendBtn.disabled = false;
            statusDiv.textContent = 'API key saved. Click "Start Listening" to begin';
            addMessage('API key saved. I\'m ready to assist you now!', 'bot');
        } else {
            statusDiv.textContent = 'Please enter a valid API key';
        }
    });

    // Show API key form when update button is clicked
    showApiFormBtn.addEventListener('click', () => {
        apiKeyContainer.style.display = 'block';
        apiKeyInput.value = apiKey;
        apiKeyInput.focus();
    });

    // Personal profile information
    const personalContext = `
    Personal information:

    Life story: You grew up in a small town, developed a passion for technology early, and now work in software development. You've overcome challenges through perseverance and are proud of your journey from self-taught programmer to professional.

    Greatest strength: Your ability to quickly learn new technologies and adapt to changing environments.

    Areas for growth:
    1. Public speaking and presentation skills
    2. Work-life balance and stress management
    3. Leadership and team management

    Common misconception: That you're always serious and work-focused, when actually you have a playful sense of humor and enjoy creative hobbies outside work.

    Personal philosophy: Taking on projects slightly beyond your comfort zone, setting ambitious learning goals, and seeking feedback from mentors to continuously improve.
    `;

    // Event Listeners
    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);
    stopSpeakingBtn.addEventListener('click', stopSpeaking);
    testApiBtn.addEventListener('click', testApiConnection);
    sendBtn.addEventListener('click', () => {
        const question = textQuestion.value.trim();
        if (question) {
            handleUserInput(question);
            textQuestion.value = '';
        }
    });

    textQuestion.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const question = textQuestion.value.trim();
            if (question) {
                handleUserInput(question);
                textQuestion.value = '';
            }
        }
    });

    // Speech Recognition Event Handlers
    if (recognition) {
        recognition.onstart = () => {
            statusDiv.textContent = 'Listening...';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        };

        recognition.onend = () => {
            statusDiv.textContent = 'Click "Start Listening" to begin';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript.trim();
            
            if (text) {
                handleUserInput(text);
            }
        };

        recognition.onerror = (event) => {
            statusDiv.textContent = `Error occurred in recognition: ${event.error}`;
        };
    }

    // Functions
    function startListening() {
        if (!apiKey) {
            statusDiv.textContent = 'API key is missing. Please check the code.';
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.error('Recognition error:', error);
            statusDiv.textContent = 'Error starting speech recognition';
        }
    }

    function stopListening() {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Recognition error:', error);
        }
    }

    function handleUserInput(text) {
        addMessage(text, 'user');
        getAIResponse(text);
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function getAIResponse(question) {
        if (!apiKey) {
            addMessage('API key is missing. Please check the code.', 'bot');
            return;
        }

        statusDiv.textContent = 'Thinking...';
        console.log('Sending request to OpenRouter API...');
        console.log('API Key (first few chars):', apiKey.substring(0, 5) + '...');

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://vedantgit1.github.io/chatbotmodel/',
                    'X-Title': 'Personal Voice Assistant',
                    'Origin': 'https://vedantgit1.github.io',
                    'OpenRouter-Lite': 'true'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-r1:free',
                    messages: [
                        { role: 'system', content: personalContext },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response received successfully');
            const aiResponse = data.choices[0].message.content.trim();
            
            addMessage(aiResponse, 'bot');
            speakText(aiResponse);
            statusDiv.textContent = 'Response received';
            
        } catch (error) {
            console.error('Error calling API:', error);
            addMessage(`Sorry, there was an error: ${error.message}`, 'bot');
            statusDiv.textContent = 'Error occurred';
        }
    }

    function speakText(text) {
        // Cancel any ongoing speech first
        stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        synth.speak(utterance);
    }

    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
            statusDiv.textContent = 'Speech stopped';
            setTimeout(() => {
                statusDiv.textContent = 'Click "Start Listening" to begin';
            }, 1500);
        }
    }

    // Test API connection function
    async function testApiConnection() {
        if (!apiKey) {
            addMessage('API key is missing. Please enter your OpenRouter API key first.', 'bot');
            return;
        }

        statusDiv.textContent = 'Testing API connection...';
        addMessage('Testing connection to OpenRouter API...', 'bot');

        try {
            console.log('Testing API connection...');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Personal Voice Assistant',
                    'Origin': window.location.origin,
                    'OpenRouter-Lite': 'true'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-r1:free',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: 'Say "API connection successful!" and nothing else.' }
                    ],
                    temperature: 0.7,
                    max_tokens: 50
                })
            });

            console.log('Test response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Test Error:', errorText);
                throw new Error(`API test failed with status ${response.status}`);
            }

            const data = await response.json();
            const testResponse = data.choices[0].message.content.trim();

            addMessage(`✅ ${testResponse}`, 'bot');
            statusDiv.textContent = 'API connection successful!';
            console.log('API test successful');

        } catch (error) {
            console.error('API Test Error:', error);
            addMessage(`❌ API connection failed: ${error.message}`, 'bot');
            addMessage('Please check your API key and browser console for more details.', 'bot');
            statusDiv.textContent = 'API connection failed';
        }
    }

    // Add welcome message
    addMessage('Hello! I\'m your personal voice assistant. Ask me questions as if you were talking to me directly.', 'bot');
});