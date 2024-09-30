// Arrays to hold data from JSON files
let occupations = [];
let placesOfLiving = [];
let darkSecrets = [];
let scenes = [];
let lang = 'en'; // Default language
let settingsChanged = false; // Flag to track if settings have changed

// Variables to hold settings
let minAgeDefault = 1;
let maxAgeDefault = 120;
let numCharactersDefault = 3;
let newLang = lang;

// Global variable to store generated characters and scene
let generatedCharacters = [];
let scene = "";

// Function to load JSON data
async function loadData() {
    try {
        const [occupationsResponse, placesResponse, secretsResponse, scenesResponse] = await Promise.all([
            fetch('occupations.json'),
            fetch('placeofliving.json'),
            fetch('darksecrets.json'),
            fetch('scenes.json')
        ]);

        occupations = await occupationsResponse.json();
        placesOfLiving = await placesResponse.json();
        darkSecrets = await secretsResponse.json();
        scenes = await scenesResponse.json();

        // Enable the Generate Characters button after data is loaded
        document.getElementById('generate-button').disabled = false;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load character or scene data. Please try again later.');
    }
}

// Function to generate random character data
function generateCharacterData(index, minAge, maxAge) {
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const gender = Math.random() < 0.5 ? 'Male' : 'Female';
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const placeOfLiving = placesOfLiving[Math.floor(Math.random() * placesOfLiving.length)];
    const darkSecret = darkSecrets[Math.floor(Math.random() * darkSecrets.length)];
    const name = 'Character ' + (index + 1);

    return {
        name,
        age,
        gender,
        occupation,
        placeOfLiving,
        darkSecret,
        quill: null, // Placeholder for Quill editor instance
    };
}

// Function to generate characters and update the UI
function generateCharacters() {
    // Hide the button
    document.getElementById('button-container').style.display = 'none';

    // Hide the instructions Section
    document.getElementById('tips-section').style.display = 'none';

    // Show the tabs container
    document.getElementById('tabs-container').style.display = 'block';

    // Get a scene at random
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    document.getElementById('scene-text').innerHTML = scene

    // Get settings from localStorage
    const minAge = parseInt(localStorage.getItem('minAge'), 10) || minAgeDefault;
    const maxAge = parseInt(localStorage.getItem('maxAge'), 10) || maxAgeDefault;
    const numCharacters = parseInt(localStorage.getItem('numCharacters'), 10) || numCharactersDefault;

    // Validate min and max age
    if (minAge > maxAge) {
        alert('Min Age cannot be greater than Max Age.');
        return;
    }

    // Generate character data
    let characters = [];
    for (let i = 0; i < numCharacters; i++) {
        characters.push(generateCharacterData(i, minAge, maxAge));
    }

    // Ensure variety in genders
    const genders = characters.map((char) => char.gender);
    const uniqueGenders = new Set(genders);

    if (uniqueGenders.size === 1 && characters.length > 1) {
        // All characters have the same gender
        // Change the gender of one character to the opposite
        const oppositeGender = genders[0] === 'Male' ? 'Female' : 'Male';
        const randomIndex = Math.floor(Math.random() * characters.length);
        characters[randomIndex].gender = oppositeGender;
    }

    // Store the generated characters
    generatedCharacters = characters;

    // Get references to tabs navigation and content
    const tabsNav = document.getElementById('characterTabs');
    const tabsContent = document.getElementById('characterTabsContent');

    // Clear any existing tabs and content
    tabsNav.innerHTML = '';
    tabsContent.innerHTML = '';

    characters.forEach((character, index) => {
        const tabId = 'character' + index;

        // Create tab nav item
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        const navLink = document.createElement('a');
        navLink.className = 'nav-link' + (index === 0 ? ' active' : '');
        navLink.id = tabId + '-tab';
        navLink.setAttribute('data-bs-toggle', 'tab');
        navLink.href = '#' + tabId;
        navLink.role = 'tab';
        navLink.innerText = character.name;
        navItem.appendChild(navLink);
        tabsNav.appendChild(navItem);

        // Create tab pane
        const tabPane = document.createElement('div');
        tabPane.className = 'tab-pane fade' + (index === 0 ? ' show active' : '');
        tabPane.id = tabId;
        tabPane.role = 'tabpanel';

        // Create row with two columns
        const row = document.createElement('div');
        row.className = 'row mt-4';

        // Left Column - Character Info
        const colLeft = document.createElement('div');
        colLeft.className = 'col-md-6 col-12 character-info';

        // Create name input field
        const nameLabel = document.createElement('label');
        nameLabel.className = 'character-name-label';
        nameLabel.innerText = 'Name:';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control character-name-input';
        nameInput.value = character.name;

        // Event listener to update tab label when name changes
        nameInput.addEventListener('input', function () {
            character.name = nameInput.value || 'Unnamed Character';
            navLink.innerText = character.name;
        });

        // Append name label and input to the left column
        colLeft.appendChild(nameLabel);
        colLeft.appendChild(nameInput);

        // Add character information with regenerate buttons
        const charInfo = document.createElement('div');

        // Age Row
        const ageRow = document.createElement('div');
        ageRow.className = 'mb-2';
        ageRow.innerHTML = `<p class="mb-0"><strong>Age:</strong> ${character.age}</p>`;
        charInfo.appendChild(ageRow);

        // Gender Row
        const genderRow = document.createElement('div');
        genderRow.className = 'mb-2';
        genderRow.innerHTML = `<p class="mb-0"><strong>Gender:</strong> ${character.gender}</p>`;
        charInfo.appendChild(genderRow);

        // Occupation Row
        const occupationRow = document.createElement('div');
        occupationRow.className = 'd-flex align-items-center mb-2';
        occupationRow.innerHTML = `<p class="mb-0"><strong>Occupation:</strong> <span id="occupation-${index}">${character.occupation}</span></p>`;
        const regenOccupationBtn = document.createElement('button');
        regenOccupationBtn.className = 'btn btn-link btn-sm ms-2';
        regenOccupationBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
        regenOccupationBtn.addEventListener('click', () => {
            character.occupation = occupations[Math.floor(Math.random() * occupations.length)];
            document.getElementById(`occupation-${index}`).innerText = character.occupation;
        });
        occupationRow.appendChild(regenOccupationBtn);
        charInfo.appendChild(occupationRow);

        // Place of Living Row
        const placeRow = document.createElement('div');
        placeRow.className = 'd-flex align-items-center mb-2';
        placeRow.innerHTML = `<p class="mb-0"><strong>Place of Living:</strong> <span id="place-${index}">${character.placeOfLiving}</span></p>`;
        const regenPlaceBtn = document.createElement('button');
        regenPlaceBtn.className = 'btn btn-link btn-sm ms-2';
        regenPlaceBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
        regenPlaceBtn.addEventListener('click', () => {
            character.placeOfLiving = placesOfLiving[Math.floor(Math.random() * placesOfLiving.length)];
            document.getElementById(`place-${index}`).innerText = character.placeOfLiving;
        });
        placeRow.appendChild(regenPlaceBtn);
        charInfo.appendChild(placeRow);

        // Dark Secret Row
        const secretRow = document.createElement('div');
        secretRow.className = 'd-flex align-items-center mb-2';
        secretRow.innerHTML = `<p class="mb-0"><strong>Dark Secret:</strong> <span id="secret-${index}">${character.darkSecret}</span></p>`;
        const regenSecretBtn = document.createElement('button');
        regenSecretBtn.className = 'btn btn-link btn-sm ms-2';
        regenSecretBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
        regenSecretBtn.addEventListener('click', () => {
            character.darkSecret = darkSecrets[Math.floor(Math.random() * darkSecrets.length)];
            document.getElementById(`secret-${index}`).innerText = character.darkSecret;
        });
        secretRow.appendChild(regenSecretBtn);
        charInfo.appendChild(secretRow);

        // Add a question mark icon with tooltip
        const tooltipIcon = document.createElement('i');
        tooltipIcon.className = 'bi bi-question-circle-fill ms-2';
        tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
        tooltipIcon.setAttribute('data-bs-placement', 'top');
        tooltipIcon.setAttribute('title', 'You can reroll Occupation, Place of Living, or Dark Secret if they break the consistency.');
        charInfo.appendChild(tooltipIcon);

        // Initialize tooltip
        const tooltip = new bootstrap.Tooltip(tooltipIcon);

        colLeft.appendChild(charInfo);

        // Right Column - Rich Text Input
        const colRight = document.createElement('div');
        colRight.className = 'col-md-6 col-12';
        const editorContainer = document.createElement('div');
        editorContainer.id = 'editor' + index;
        editorContainer.className = 'editor-container';

        colRight.appendChild(editorContainer);

        row.appendChild(colLeft);
        row.appendChild(colRight);
        tabPane.appendChild(row);
        tabsContent.appendChild(tabPane);
    });

    // Initialize Quill editors
    generatedCharacters.forEach((character, index) => {
        character.quill = new Quill('#editor' + index, {
            theme: 'snow',
        });
    });
}

// Event listener for the Generate Characters button
document.getElementById('generate-button').addEventListener('click', function () {
    generateCharacters();
});

// Event listener for the Regenerate All Characters button
document.getElementById('regenerate-all-button').addEventListener('click', function () {
    // Confirm with the user before regenerating
    const confirmRegenerate = confirm('Are you sure you want to regenerate all characters? All unsaved progress will be lost.');
    if (confirmRegenerate) {
        generateCharacters();
    }
});

// Event listener for the Export All Characters as PDF button
document.getElementById('export-pdf-button').addEventListener('click', function () {
    // Check if characters have been generated
    if (!generatedCharacters || generatedCharacters.length === 0) {
        alert('No characters to export. Please generate characters first.');
        return;
    }

    // Generate HTML content
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Exported Characters Report</title>
          <!-- Include Quill CSS for styling -->
          <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
          <!-- Include custom styles -->
          <style>
            body {
                font-family: 'Helvetica Neue', sans-serif;
                margin: 20px;
                color: #333;
                background-color: #f4f4f4;
                padding: 40px;
            }
            h1, h2 {
                text-align: center;
                color: #2C3E50;
            }
            h1 {
                border-bottom: 2px solid #2C3E50;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            h2 {
                margin-top: 40px;
                font-size: 24px;
                color: #2980B9;
            }
            .scene-title {
                text-align: center;
                font-size: 20px;
                margin: 20px 0;
                color: #7F8C8D;
            }
            .character {
                background-color: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                page-break-after: always;
            }
            .character:last-child {
                page-break-after: auto;
            }
            .character-info {
                margin-bottom: 15px;
                font-size: 14px;
                line-height: 1.6;
            }
            .character-info p {
                margin: 0 0 5px;
            }
            /* Quill rich text formatting */
            .ql-editor {
                font-size: 14px;
                line-height: 1.8;
            }
            /* Footer styling */
            footer {
                text-align: center;
                font-size: 12px;
                color: #7F8C8D;
                margin-top: 40px;
            }
            .toc {
                margin-bottom: 20px;
                text-align: left;
                font-size: 16px;
            }
            .toc h3 {
                color: #2980B9;
            }
            .toc ul {
                list-style-type: none;
                padding-left: 0;
            }
            .toc li {
                padding: 5px 0;
                font-size: 14px;
                color: #2C3E50;
            }
            .toc li a {
                text-decoration: none;
                color: #3498db;
            }
          </style>
        </head>
        <body>
          <h1>Exported Characters Report</h1>
          
          <div class="scene-title">
            <h2>Scene</h2>
            <p>${scene}</p>
          </div>

          <!-- Table of Contents -->
          <div class="toc">
            <h3>Table of Contents</h3>
            <ul>
    `;

    // Adding Table of Contents for characters
    generatedCharacters.forEach((character, index) => {
        htmlContent += `
          <li><a href="#character-${index}">${character.name}</a></li>
        `;
    });

    htmlContent += `
            </ul>
          </div>
    `;

    // Adding character details and rich text content
    generatedCharacters.forEach((character, index) => {
        const editorContent = character.quill.root.innerHTML; // User input with Quill editor

        htmlContent += `
          <div id="character-${index}" class="character">
            <h2>${character.name}</h2>
            <div class="character-info">
              <p><strong>Age:</strong> ${character.age}</p>
              <p><strong>Gender:</strong> ${character.gender}</p>
              <p><strong>Occupation:</strong> ${character.occupation}</p>
              <p><strong>Place of Living:</strong> ${character.placeOfLiving}</p>
              <p><strong>Dark Secret:</strong> ${character.darkSecret}</p>
            </div>
            <div class="editor-content ql-editor">
              ${editorContent}
            </div>
          </div>
        `;
    });

    htmlContent += `
          <!-- Footer -->
          <footer>
            <p>Exported on ${new Date().toLocaleDateString()}</p>
          </footer>

          <script>
              window.onload = function () {
                  // Focus on the window
                  window.focus();

                  // Optionally, trigger the print dialog automatically
                  window.print();
              };
          </script>
        </body>
        </html>
    `;

    // Open the HTML content in a new window
    const printWindow = window.open('', '', 'width=800,height=600');

    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
});

// Theme Toggle Button Event Listener
document.getElementById('theme-toggle').addEventListener('click', function () {
    const htmlElement = document.querySelector('html');
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-bs-theme', newTheme);

    // Save the new theme preference to localStorage
    localStorage.setItem('theme', newTheme);

    // Update the theme icon
    const themeIcon = document.getElementById('theme-icon');
    if (newTheme === 'dark') {
        themeIcon.classList.remove('bi-lightbulb');
        themeIcon.classList.add('bi-lightbulb-fill');
    } else {
        themeIcon.classList.remove('bi-lightbulb-fill');
        themeIcon.classList.add('bi-lightbulb');
    }
});

// Event listener for Apply Settings button
document.getElementById('apply-settings-button').addEventListener('click', function () {
    // Get input values
    const minAgeInput = parseInt(document.getElementById('min-age').value, 10);
    const maxAgeInput = parseInt(document.getElementById('max-age').value, 10);
    const numCharactersInput = parseInt(document.getElementById('num-characters').value, 10);

    // Validate min and max age
    if (minAgeInput > maxAgeInput) {
        alert('Min Age cannot be greater than Max Age.');
        return;
    }

    // Save settings to localStorage
    localStorage.setItem('minAge', minAgeInput);
    localStorage.setItem('maxAge', maxAgeInput);
    localStorage.setItem('numCharacters', numCharactersInput);

    // Save language if it has changed
    if (newLang !== lang) {
        localStorage.setItem('lang', newLang);
    }

    // Warn user about losing unsaved progress
    if (settingsChanged) {
        const confirmChange = confirm('Applying settings will reload the page and unsaved progress will be lost. Do you want to continue?');
        if (!confirmChange) {
            return;
        }
    }

    // Reload the page
    window.location.href = '/Show-em-Up/index.html';
});

// Event listener for settings inputs
document.getElementById('min-age').addEventListener('input', function () {
    settingsChanged = true;
});

document.getElementById('max-age').addEventListener('input', function () {
    settingsChanged = true;
});

document.getElementById('num-characters').addEventListener('input', function () {
    settingsChanged = true;
});

// Event listener for language select dropdown
document.getElementById('language-select').addEventListener('change', function () {
    newLang = this.value;
    settingsChanged = true;
});

// On page load, check if language and settings are set in localStorage
window.addEventListener('load', function () {
    // Language preference
    const savedLang = localStorage.getItem('lang') || 'en';
    lang = savedLang;
    document.getElementById('language-select').value = lang;

    // Theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    const htmlElement = document.querySelector('html');
    htmlElement.setAttribute('data-bs-theme', savedTheme);

    // Update the theme icon
    const themeIcon = document.getElementById('theme-icon');
    if (savedTheme === 'dark') {
        themeIcon.classList.remove('bi-lightbulb');
        themeIcon.classList.add('bi-lightbulb-fill');
    } else {
        themeIcon.classList.remove('bi-lightbulb-fill');
        themeIcon.classList.add('bi-lightbulb');
    }

    // Load settings
    const savedMinAge = localStorage.getItem('minAge');
    const savedMaxAge = localStorage.getItem('maxAge');
    const savedNumCharacters = localStorage.getItem('numCharacters');

    if (savedMinAge !== null) {
        minAge = parseInt(savedMinAge, 10);
        document.getElementById('min-age').value = minAge;
    }

    if (savedMaxAge !== null) {
        maxAge = parseInt(savedMaxAge, 10);
        document.getElementById('max-age').value = maxAge;
    }

    if (savedNumCharacters !== null) {
        numCharacters = parseInt(savedNumCharacters, 10);
        document.getElementById('num-characters').value = numCharacters;
    }
});

// Functions to save progress
function saveDataToJson() {
    // Prepare data to save
    const dataToSave = {
        scene: scene,
        characters: generatedCharacters.map(character => {
            return {
                name: character.name,
                age: character.age,
                gender: character.gender,
                occupation: character.occupation,
                placeOfLiving: character.placeOfLiving,
                darkSecret: character.darkSecret,
                quillContent: character.quill.root.innerHTML // Save Quill editor's content as HTML
            };
        })
    };

    // Convert data to JSON
    const jsonData = JSON.stringify(dataToSave, null, 2);

    // Create a Blob from the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the JSON file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'characters_and_scene.json'; // Filename for the JSON file
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

// Function to load progress
function loadDataFromJson(file) {
    // Create a FileReader to read the uploaded JSON file
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            // Hide the button
            document.getElementById('button-container').style.display = 'none';

            // Hide the instructions Section
            document.getElementById('tips-section').style.display = 'none';

            // Show the tabs container
            document.getElementById('tabs-container').style.display = 'block';
            // Parse the JSON data
            const data = JSON.parse(event.target.result);

            // Restore the scene
            scene = data.scene || "";
            document.getElementById('scene-text').innerHTML = scene;

            // Restore characters
            if (data.characters && data.characters.length > 0) {
                generatedCharacters = data.characters;

                // Get references to tabs navigation and content
                const tabsNav = document.getElementById('characterTabs');
                const tabsContent = document.getElementById('characterTabsContent');

                // Clear any existing tabs and content
                tabsNav.innerHTML = '';
                tabsContent.innerHTML = '';

                // Rebuild the UI and initialize Quill editors
                generatedCharacters.forEach((character, index) => {
                    const tabId = 'character' + index;

                    // Create tab nav item
                    const navItem = document.createElement('li');
                    navItem.className = 'nav-item';
                    const navLink = document.createElement('a');
                    navLink.className = 'nav-link' + (index === 0 ? ' active' : '');
                    navLink.id = tabId + '-tab';
                    navLink.setAttribute('data-bs-toggle', 'tab');
                    navLink.href = '#' + tabId;
                    navLink.role = 'tab';
                    navLink.innerText = character.name;
                    navItem.appendChild(navLink);
                    tabsNav.appendChild(navItem);

                    // Create tab pane
                    const tabPane = document.createElement('div');
                    tabPane.className = 'tab-pane fade' + (index === 0 ? ' show active' : '');
                    tabPane.id = tabId;
                    tabPane.role = 'tabpanel';

                    // Create row with two columns
                    const row = document.createElement('div');
                    row.className = 'row mt-4';

                    // Left Column - Character Info
                    const colLeft = document.createElement('div');
                    colLeft.className = 'col-md-6 col-12 character-info';

                    // Create name input field
                    const nameLabel = document.createElement('label');
                    nameLabel.className = 'character-name-label';
                    nameLabel.innerText = 'Name:';

                    const nameInput = document.createElement('input');
                    nameInput.type = 'text';
                    nameInput.className = 'form-control character-name-input';
                    nameInput.value = character.name;

                    // Event listener to update tab label when name changes
                    nameInput.addEventListener('input', function () {
                        character.name = nameInput.value || 'Unnamed Character';
                        navLink.innerText = character.name;
                    });

                    // Append name label and input to the left column
                    colLeft.appendChild(nameLabel);
                    colLeft.appendChild(nameInput);

                    // Add character information (age, gender, occupation, place of living, dark secret)
                    const charInfo = document.createElement('div');
                    // Age Row
                    const ageRow = document.createElement('div');
                    ageRow.className = 'mb-2';
                    ageRow.innerHTML = `<p class="mb-0"><strong>Age:</strong> ${character.age}</p>`;
                    charInfo.appendChild(ageRow);

                    // Gender Row
                    const genderRow = document.createElement('div');
                    genderRow.className = 'mb-2';
                    genderRow.innerHTML = `<p class="mb-0"><strong>Gender:</strong> ${character.gender}</p>`;
                    charInfo.appendChild(genderRow);

                    // Occupation Row
                    const occupationRow = document.createElement('div');
                    occupationRow.className = 'd-flex align-items-center mb-2';
                    occupationRow.innerHTML = `<p class="mb-0"><strong>Occupation:</strong> <span id="occupation-${index}">${character.occupation}</span></p>`;
                    const regenOccupationBtn = document.createElement('button');
                    regenOccupationBtn.className = 'btn btn-link btn-sm ms-2';
                    regenOccupationBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                    regenOccupationBtn.addEventListener('click', () => {
                        character.occupation = occupations[Math.floor(Math.random() * occupations.length)];
                        document.getElementById(`occupation-${index}`).innerText = character.occupation;
                    });
                    occupationRow.appendChild(regenOccupationBtn);
                    charInfo.appendChild(occupationRow);

                    // Place of Living Row
                    const placeRow = document.createElement('div');
                    placeRow.className = 'd-flex align-items-center mb-2';
                    placeRow.innerHTML = `<p class="mb-0"><strong>Place of Living:</strong> <span id="place-${index}">${character.placeOfLiving}</span></p>`;
                    const regenPlaceBtn = document.createElement('button');
                    regenPlaceBtn.className = 'btn btn-link btn-sm ms-2';
                    regenPlaceBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                    regenPlaceBtn.addEventListener('click', () => {
                        character.placeOfLiving = placesOfLiving[Math.floor(Math.random() * placesOfLiving.length)];
                        document.getElementById(`place-${index}`).innerText = character.placeOfLiving;
                    });
                    placeRow.appendChild(regenPlaceBtn);
                    charInfo.appendChild(placeRow);

                    // Dark Secret Row
                    const secretRow = document.createElement('div');
                    secretRow.className = 'd-flex align-items-center mb-2';
                    secretRow.innerHTML = `<p class="mb-0"><strong>Dark Secret:</strong> <span id="secret-${index}">${character.darkSecret}</span></p>`;
                    const regenSecretBtn = document.createElement('button');
                    regenSecretBtn.className = 'btn btn-link btn-sm ms-2';
                    regenSecretBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                    regenSecretBtn.addEventListener('click', () => {
                        character.darkSecret = darkSecrets[Math.floor(Math.random() * darkSecrets.length)];
                        document.getElementById(`secret-${index}`).innerText = character.darkSecret;
                    });
                    secretRow.appendChild(regenSecretBtn);
                    charInfo.appendChild(secretRow);

                    // Add a question mark icon with tooltip
                    const tooltipIcon = document.createElement('i');
                    tooltipIcon.className = 'bi bi-question-circle-fill ms-2';
                    tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
                    tooltipIcon.setAttribute('data-bs-placement', 'top');
                    tooltipIcon.setAttribute('title', 'You can reroll Occupation, Place of Living, or Dark Secret if they break the consistency.');
                    charInfo.appendChild(tooltipIcon);

                    // Initialize tooltip
                    const tooltip = new bootstrap.Tooltip(tooltipIcon);

                    colLeft.appendChild(charInfo);

                    // Right Column - Rich Text Input
                    const colRight = document.createElement('div');
                    colRight.className = 'col-md-6 col-12';
                    const editorContainer = document.createElement('div');
                    editorContainer.id = 'editor' + index;
                    editorContainer.className = 'editor-container';
                    colRight.appendChild(editorContainer);

                    row.appendChild(colLeft);
                    row.appendChild(colRight);
                    tabPane.appendChild(row);
                    tabsContent.appendChild(tabPane);
                });

                // Initialize Quill editors and load content
                generatedCharacters.forEach((character, index) => {
                    character.quill = new Quill('#editor' + index, {
                        theme: 'snow',
                    });

                    // Restore the saved Quill content (HTML)
                    character.quill.root.innerHTML = character.quillContent;
                });
            }

        } catch (error) {
            alert('Error loading JSON file: ' + error.message);
        }
    };

    // Read the file as text
    reader.readAsText(file);
}

// Get references to the button and file input
const uploadButton = document.getElementById('upload-btn');
const downloadButton = document.getElementById('download-btn');
const fileInput = document.getElementById('file-input');

// Add event listener to the button to trigger the file input click
uploadButton.addEventListener('click', function() {
    fileInput.click(); // Programmatically click the hidden file input
});

// Add an event listener to handle the file selection
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        loadDataFromJson(file); // Call the function to load the file content
    }
});

// Add event listener to the button to trigger the save progress
downloadButton.addEventListener('click', function() {
    saveDataToJson();
});


// Call loadData when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadData();
});