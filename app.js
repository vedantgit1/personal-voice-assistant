// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const apiSection = document.getElementById('api-section');
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key');
    const chatContainer = document.getElementById('chat-container');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const stopSpeakingBtn = document.getElementById('stop-speaking-btn');
    const statusDiv = document.getElementById('status');
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('send-btn');
    
    // API Key Management
    let apiKey = '';
    
    // Check for saved API key
    if (localStorage.getItem('openrouter_api_key')) {
        apiKey = localStorage.getItem('openrouter_api_key');
        apiKeyInput.value = apiKey;
        apiSection.style.display = 'none';
        addMessage('Welcome back to Voice Bot! I\'m ready to assist you.', 'bot');
    } else {
        startBtn.disabled = true;
        sendBtn.disabled = true;
        addMessage('Please enter your OpenRouter API key to begin.', 'bot');
    }
    
    // Save API Key
    saveKeyBtn.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            apiKey = key;
            localStorage.setItem('openrouter_api_key', apiKey);
            apiSection.style.display = 'none';
            startBtn.disabled = false;
            sendBtn.disabled = false;
            addMessage('API key saved. Voice Bot is ready to assist you!', 'bot');

            // Send a welcome message to test the connection
            setTimeout(() => {
                processUserInput('Hello');
            }, 1000);

            updateStatus('Ready');
        } else {
            updateStatus('Please enter a valid API key');
        }
    });
    
    // Speech Recognition Setup
    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            updateStatus('Listening...');
            startBtn.disabled = true;
            stopBtn.disabled = false;
        };
        
        recognition.onend = function() {
            updateStatus('Ready');
            startBtn.disabled = false;
            stopBtn.disabled = true;
        };
        
        recognition.onresult = function(event) {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript.trim();
            
            if (text) {
                processUserInput(text);
            }
        };
        
        recognition.onerror = function(event) {
            updateStatus('Error: ' + event.error);
            startBtn.disabled = false;
            stopBtn.disabled = true;
        };
    } else {
        startBtn.disabled = true;
        updateStatus('Speech recognition not supported in this browser');
        addMessage('Speech recognition is not supported in your browser. Please use the text input instead.', 'bot');
    }
    
    // Event Listeners
    startBtn.addEventListener('click', function() {
        if (!apiKey) {
            updateStatus('Please enter your API key first');
            apiSection.style.display = 'block';
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.error('Recognition error:', error);
            updateStatus('Error starting recognition');
        }
    });

    stopBtn.addEventListener('click', function() {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    });

    stopSpeakingBtn.addEventListener('click', function() {
        stopSpeaking();
    });

    sendBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        if (text) {
            processUserInput(text);
            textInput.value = '';
        }
    });

    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const text = textInput.value.trim();
            if (text) {
                processUserInput(text);
                textInput.value = '';
            }
        }
    });

    // Helper Functions
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender + '-message');
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function updateStatus(text) {
        statusDiv.textContent = text;
    }
    
    function processUserInput(text) {
        if (!apiKey) {
            updateStatus('Please enter your API key first');
            apiSection.style.display = 'block';
            return;
        }
        
        addMessage(text, 'user');
        updateStatus('Thinking...');
        
        // Disable buttons while processing
        sendBtn.disabled = true;
        startBtn.disabled = true;
        
        getAIResponse(text)
            .finally(() => {
                // Re-enable buttons
                if (!recognition || !recognition.recognizing) {
                    startBtn.disabled = false;
                }
                sendBtn.disabled = false;
            });
    }
    
    async function getAIResponse(question) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Voice Bot'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Voice Bot, a helpful voice assistant. Keep your answers concise and friendly.'
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your API key and try again.');
                } else {
                    throw new Error(`API request failed with status ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const aiResponse = data.choices[0].message.content.trim();
                addMessage(aiResponse, 'bot');
                speakResponse(aiResponse);
                updateStatus('Ready');
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error: ' + error.message, 'bot');
            updateStatus('Error occurred');
        }
    }
    
    function speakResponse(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech first
            stopSpeaking();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    }

    function stopSpeaking() {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            updateStatus('Speech stopped');
            setTimeout(() => {
                updateStatus('Ready');
            }, 1000);
        }
    }
});