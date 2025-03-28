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

    // API key should be entered by the user, not hardcoded
    const newApiKey = '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'; // Replace with your actual API key when testing locally

    // Add a function to clear localStorage
    function clearStoredApiKey() {
        localStorage.removeItem('openrouter_api_key');
        apiKeyInput.value = '';
        apiSection.style.display = 'block';
        apiKey = '';
        startBtn.disabled = true;
        sendBtn.disabled = true;
        addMessage('API key has been cleared. Please enter a new API key.', 'bot');
    }

    // Create clear API key button
    const clearKeyBtn = document.createElement('button');
    clearKeyBtn.id = 'clear-key';
    clearKeyBtn.textContent = 'Clear API Key';
    clearKeyBtn.className = 'btn btn-warning';
    clearKeyBtn.style.marginLeft = '10px';
    clearKeyBtn.addEventListener('click', clearStoredApiKey);

    // Add the clear button next to the save button
    saveKeyBtn.parentNode.insertBefore(clearKeyBtn, saveKeyBtn.nextSibling);

    // Check for saved API key
    if (localStorage.getItem('openrouter_api_key')) {
        apiKey = localStorage.getItem('openrouter_api_key');
        apiKeyInput.value = apiKey;
        apiSection.style.display = 'none';
        addMessage('Welcome back to Voice Bot! I\'m ready to assist you.', 'bot');
        startBtn.disabled = false;
        sendBtn.disabled = false;
    } else {
        // No saved API key, show the input section
        startBtn.disabled = true;
        sendBtn.disabled = true;
        addMessage('Please enter your OpenRouter API key to begin.', 'bot');
        apiSection.style.display = 'block';
    }
    
    // Function to test API key and fetch available models
    async function testApiKey(key) {
        updateStatus('Testing API key...');
        try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${key}`,
                }
            });

            if (!response.ok) {
                console.error('API key test failed:', await response.text());
                return false;
            }

            const data = await response.json();
            console.log('API key test successful:', data);

            // Store some recommended models for fallback
            window.availableModels = [
                'deepseek/deepseek-r1:free', // Free model as primary choice
                'openai/gpt-3.5-turbo',
                'openai/gpt-4',
                'anthropic/claude-3-haiku',
                'google/gemini-pro'
            ];

            // Update with actual available models if possible
            if (data && data.data && Array.isArray(data.data)) {
                window.availableModels = data.data
                    .filter(model => model.id && typeof model.id === 'string')
                    .map(model => model.id)
                    .slice(0, 10); // Get top 10 models
                console.log('Available models:', window.availableModels);
            }

            return true;
        } catch (error) {
            console.error('API key test error:', error);
            return false;
        }
    }

    // Save API Key
    saveKeyBtn.addEventListener('click', async function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            updateStatus('Validating API key...');

            // Test the API key first
            const isValid = await testApiKey(key);

            if (isValid) {
                apiKey = key;
                localStorage.setItem('openrouter_api_key', apiKey);
                apiSection.style.display = 'none';
                startBtn.disabled = false;
                sendBtn.disabled = false;
                addMessage('API key validated and saved. Voice Bot is ready to assist you!', 'bot');

                // Send a welcome message to test the connection
                setTimeout(() => {
                    processUserInput('Hello');
                }, 1000);

                updateStatus('Ready');
            } else {
                updateStatus('Invalid API key. Please check and try again.');
                addMessage('The API key could not be validated. Please check that you have entered it correctly.', 'bot');
            }
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
    
    async function getAIResponse(question, modelIndex = 0) {
        try {
            // Log the API key being used (first 10 chars only for security)
            console.log('Using API key starting with:', apiKey.substring(0, 10) + '...');

            // Get available models or use defaults
            const models = window.availableModels || [
                'deepseek/deepseek-r1:free', // Free model as primary choice
                'openai/gpt-3.5-turbo',
                'openai/gpt-4',
                'anthropic/claude-3-haiku',
                'google/gemini-pro'
            ];

            // If we've tried all models, give up
            if (modelIndex >= models.length) {
                throw new Error('All available models failed. Please try again later or check your API key.');
            }

            // Get the current model to try
            const currentModel = models[modelIndex];
            updateStatus(`Connecting to OpenRouter using ${currentModel}...`);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Voice Bot'
                },
                body: JSON.stringify({
                    model: currentModel,
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

            // Log the response status
            console.log(`OpenRouter API response status for ${currentModel}:`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);

                if (response.status === 401) {
                    // Show the API key input section if authentication fails
                    apiSection.style.display = 'block';
                    throw new Error('Invalid API key. Please check your API key and try again.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status === 404) {
                    console.log(`Model ${currentModel} not available, trying next model...`);
                    // Try the next model
                    return getAIResponse(question, modelIndex + 1);
                } else {
                    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
                }
            }

            const data = await response.json();
            console.log('API Response Data:', data);

            if (data.choices && data.choices[0] && data.choices[0].message) {
                const aiResponse = data.choices[0].message.content.trim();
                // Add model info to the message
                addMessage(`[Using ${currentModel}]\n${aiResponse}`, 'bot');
                speakResponse(aiResponse);
                updateStatus('Ready');
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error: ' + error.message, 'bot');
            updateStatus('Error occurred');

            // If it's an API key error, show a helpful message
            if (error.message.includes('API key')) {
                addMessage('Try clicking the "Clear API Key" button and entering a new API key.', 'bot');
            }
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