let scene, camera, renderer, avatar;
let mouthOpenIndex = null;
let isSpeaking = false;
let currentAnimation = null;
let headBoneNode = null;
let spineBoneNode = null;
let leftShoulderNode = null;
let rightShoulderNode = null;
let leftArmNode = null;
let rightArmNode = null;
let initialRotations = {
    head: new THREE.Euler(),
    spine: new THREE.Euler(),
    leftShoulder: new THREE.Euler(),
    rightShoulder: new THREE.Euler(),
    leftArm: new THREE.Euler(),
    rightArm: new THREE.Euler()
};
let eyeBlinkIndex = null;

// Add new variables for file handling
let processedText = '';

// Modify the speechText variable to be dynamic
let speechText = '';

// Add new variables for teacher-specific gestures
let isExplaining = false;
let currentPosture = 'neutral';
let lastGestureTime = 0;

// Add these variables at the top with other declarations
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

// Add movement delay variables
let lastMovementTime = 0;
const MOVEMENT_DELAY = 2000; // 2 seconds between movements

// Add these popup-related functions
function showUploadPopup() {
    document.getElementById('uploadPopup').style.display = 'block';
}

function hideUploadPopup() {
    document.getElementById('uploadPopup').style.display = 'none';
}

function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (validateFileType(file)) {
            document.getElementById('fileName').textContent = `Selected file: ${file.name}`;
        } else {
            event.target.value = ''; // Clear the file input
            document.getElementById('fileName').textContent = '';
        }
    }
}

function setupMouseTracking() {
    document.addEventListener('mousemove', (event) => {
        const currentTime = Date.now();
        if (currentTime - lastMovementTime < MOVEMENT_DELAY) {
            return; // Skip if not enough time has passed
        }
        
        // Get mouse position relative to the window center
        mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        
        // Convert mouse position to rotation angles
        targetRotationY = mouseX * 0.1; // Further reduced rotation amount
        targetRotationX = -mouseY * 0.1; // Further reduced rotation amount
        
        lastMovementTime = currentTime;
    });
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    setupFileUpload();
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadAvatar() {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        const avatarUrl = 'https://models.readyplayer.me/6738baadbdc370b5cbbaba87.glb';

        loader.load(
            avatarUrl,
            (gltf) => {
                avatar = gltf.scene;
                scene.add(avatar);

                avatar.position.set(2.5, -7.0, 0);
                avatar.rotation.y = -0.2;
                avatar.scale.set(4, 4, 2);

                setupAvatarBones(gltf);
                startTeacherBehavior();
                startBlinking();
                
                resolve();
            },
            undefined,
            reject
        );
    });
}

function startTeacherBehavior() {
    console.log('Starting teacher behavior');
    
    function animate() {
        const time = Date.now() * 0.001;

        // Head tracking movement
        if (headBoneNode) {
            // Smoothly interpolate current rotation to target rotation
            const currentX = headBoneNode.rotation.x;
            const currentY = headBoneNode.rotation.y;
            
            // Adjust rotation to make the eyes look towards the cursor
            headBoneNode.rotation.x = THREE.MathUtils.lerp(currentX, initialRotations.head.x + targetRotationX, 0.1);
            headBoneNode.rotation.y = THREE.MathUtils.lerp(currentY, initialRotations.head.y + targetRotationY, 0.1);
            
            // Debug log
            console.log('Head rotation:', { 
                x: headBoneNode.rotation.x, 
                y: headBoneNode.rotation.y 
            });
        } else {
            console.warn('headBoneNode is not defined or not found');
        }

        // Keep existing breathing and other animations
        if (spineBoneNode) {
            spineBoneNode.rotation.x = initialRotations.spine.x + Math.sin(time * 0.8) * 0.05;
        }

        if (leftShoulderNode && rightShoulderNode) {
            const breatheAmount = Math.sin(time * 0.8) * 0.03;
            leftShoulderNode.rotation.x = initialRotations.leftShoulder.x + breatheAmount;
            rightShoulderNode.rotation.x = initialRotations.rightShoulder.x + breatheAmount;
        }

        requestAnimationFrame(animate);
    }

    animate();
}

function startBlinking() {
    function blink() {
        avatar.traverse((node) => {
            if (node.isMesh && node.morphTargetInfluences && node.morphTargetDictionary) {
                const blinkIndex = node.morphTargetDictionary['eyesClosed'];
                if (blinkIndex !== undefined) {
                    // Quick blink animation
                    node.morphTargetInfluences[blinkIndex] = 1;
                    setTimeout(() => {
                        node.morphTargetInfluences[blinkIndex] = 0;
                    }, 150);
                }
            }
        });

        // Random interval between 2 and 6 seconds
        const nextBlink = 2000 + Math.random() * 4000;
        setTimeout(blink, nextBlink);
    }

    // Start the blinking
    blink();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function setupSpeechButton() {
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            startSpeaking();
        }
    });
}

function startSpeaking() {
    if (!window.speechSynthesis || !speechText) {
        alert('Either Speech Synthesis is not supported or no content has been processed yet.');
        return;
    }

    const speech = new SpeechSynthesisUtterance(speechText);
    const captionsDiv = document.getElementById('captions');
    captionsDiv.textContent = ''; // Clear previous content
    
    // Show the captions container
    document.getElementById('captions-container').style.display = 'block';

    speech.onboundary = function(event) {
        const text = speechText.substring(event.charIndex, event.charIndex + event.charLength);
        captionsDiv.textContent += text + ' ';
        
        // Check if scrolling is needed
        if (captionsDiv.scrollHeight > captionsDiv.clientHeight) {
            captionsDiv.scrollTop = captionsDiv.scrollHeight - captionsDiv.clientHeight;
        }
    };

    // Force voice selection to wait for voices to load
    const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices); // Debug available voices

        // List of preferred female voice names (add more based on your testing)
        const femaleVoiceNames = [
            'Microsoft Zira',
            'Google US English Female',
            'Samantha',
            'Karen',
            'Victoria',
            'Microsoft Eva',
            'Microsoft Hazel',
            'Microsoft Zira Desktop',
            'Moira',
            'Tessa',
            'Veena',
            'Fiona',
            'Alice'
        ];

        // First try: exact match from our list
        let femaleVoice = voices.find(voice => 
            femaleVoiceNames.some(name => voice.name.includes(name))
        );

        // Second try: any voice with "female" in the name
        if (!femaleVoice) {
            femaleVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female')
            );
        }

        // Third try: any English voice that seems female
        if (!femaleVoice) {
            femaleVoice = voices.find(voice => 
                (voice.lang.includes('en') || voice.lang.includes('US')) &&
                (voice.name.includes('f') || voice.name.includes('F'))
            );
        }

        if (femaleVoice) {
            speech.voice = femaleVoice;
            console.log('Selected voice:', femaleVoice.name);
        } else {
            console.warn('No female voice found. Available voices:', voices);
        }

        // Adjust voice parameters for more feminine sound
        speech.pitch = 1.3;  // Higher pitch
        speech.rate = 0.9;   // Slightly slower
        speech.volume = 1;

        // Start the speech
        window.speechSynthesis.speak(speech);
    };

    // Make sure voices are loaded before setting the voice
    if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
    } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
    }

    isSpeaking = true;
    startMouthAnimation();

    speech.onend = () => {
        stopSpeaking();
    };

    speech.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        stopSpeaking();
    };
}

// Add this helper function to test available voices
function listAvailableVoices() {
    const voices = window.speechSynthesis.getVoices();
    console.log('All available voices:');
    voices.forEach(voice => {
        console.log(`Name: ${voice.name}, Lang: ${voice.lang}, Default: ${voice.default}`);
    });
}

// Call this when the page loads
window.speechSynthesis.onvoiceschanged = listAvailableVoices;

function stopSpeaking() {
    isSpeaking = false;
    window.speechSynthesis.cancel();
    
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
    }

    avatar.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences && mouthOpenIndex !== null) {
            child.morphTargetInfluences[mouthOpenIndex] = 0;
        }
    });

    const startButton = document.getElementById('startButton');
    startButton.textContent = 'Start Speaking';
}

// Modify your existing setupFileUpload function
function setupFileUpload() {
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
    const loadingDiv = document.getElementById('loading');
    const dropZone = document.getElementById('dropZone');

    // Add drag and drop support
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(74, 144, 226, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
        
        const file = e.dataTransfer.files[0];
        if (file && validateFileType(file)) {
            fileInput.files = e.dataTransfer.files;
            document.getElementById('fileName').textContent = `Selected file: ${file.name}`;
        }
    });

    uploadButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        hideUploadPopup();
        loadingDiv.style.display = 'block';
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/process-file', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error processing file');
            }

            const data = await response.json();
            
            if (!data.summary) {
                throw new Error('No content could be extracted');
            }

            speechText = data.summary;
            await loadAvatar();
            document.getElementById('captions-container').style.display = 'block';
            
            setTimeout(() => {
                startSpeaking();
            }, 1000);
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            loadingDiv.style.display = 'none';
        }
    });
}

function validateFileType(file) {
    const allowedTypes = ['.pdf', '.pptx', '.txt'];
    const fileExtension = file.name.toLowerCase().slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
    
    if (!allowedTypes.includes(`.${fileExtension}`)) {
        alert(`Invalid file type. Please upload ${allowedTypes.join(', ')} files only.`);
        return false;
    }
    return true;
}

function startMouthAnimation() {
    const animateMouth = () => {
        if (!isSpeaking) return;

        avatar.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences && mouthOpenIndex !== null) {
                // Create a natural-looking mouth movement
                const time = Date.now() * 0.005;
                const mouthOpen = Math.sin(time) * 0.5 + 0.5; // Value between 0 and 1
                child.morphTargetInfluences[mouthOpenIndex] = mouthOpen * 0.5; // Reduce the maximum opening
            }
        });

        currentAnimation = requestAnimationFrame(animateMouth);
    };

    animateMouth();
}

function setupAvatarBones(gltf) {
    avatar.traverse((node) => {
        // Find mouth morph target
        if (node.isMesh && node.morphTargetDictionary) {
            if (node.morphTargetDictionary.hasOwnProperty('mouthOpen')) {
                mouthOpenIndex = node.morphTargetDictionary['mouthOpen'];
            }
            if (node.morphTargetDictionary.hasOwnProperty('eyesClosed')) {
                eyeBlinkIndex = node.morphTargetDictionary['eyesClosed'];
            }
        }

        // Store initial bone rotations
        if (node.isBone) {
            switch(node.name.toLowerCase()) {
                case 'head':
                    headBoneNode = node;
                    initialRotations.head.copy(node.rotation);
                    break;
                case 'spine':
                    spineBoneNode = node;
                    initialRotations.spine.copy(node.rotation);
                    break;
                case 'leftshoulder':
                    leftShoulderNode = node;
                    initialRotations.leftShoulder.copy(node.rotation);
                    break;
                case 'rightshoulder':
                    rightShoulderNode = node;
                    initialRotations.rightShoulder.copy(node.rotation);
                    break;
                case 'leftarm':
                    leftArmNode = node;
                    initialRotations.leftArm.copy(node.rotation);
                    break;
                case 'rightarm':
                    rightArmNode = node;
                    initialRotations.rightArm.copy(node.rotation);
                    break;
            }
        }
    });
}

init();
