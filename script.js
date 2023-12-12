// Global variables
let gbl_gridSize;               
let gbl_currentColor;         
let gbl_gridVisible;        
let gbl_currentColorOption;
let gbl_shadingValue;
let gbl_cells;


initialize();


function initialize() {
    setDefaults();

    generateGrid();

    addGridSizeSliderEventListeners();
    addColorOptionsEventListeners();
    addShowGridBtnEventListeners();
    addClearBtnEventListeners();
    setupColorPicker();
}

function setDefaults() {
    gbl_gridSize = 16;
    gbl_currentColor = '#333';
    gbl_gridVisible = false;
    gbl_shadingValue = 255 / 15;

    const defaultColorOption = document.querySelector('#color-btn');
    defaultColorOption.classList.add('selected');
    gbl_currentColorOption = defaultColorOption;
    
    setGridSizeLabel();
}

function generateGrid() {
    const grid = document.querySelector('.grid');

    grid.style.height = `${window.innerHeight * 0.8}px`;
    grid.style.width = grid.style.height;

    grid.replaceChildren();
    generateCells(grid);
    addCellEventListeners();
}

function generateCells(grid) {
    for (let i = 0; i < gbl_gridSize; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        grid.appendChild(row);
        for (let j = 0; j < gbl_gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (gbl_gridVisible)
                cell.classList.add('grid-visible');
            row.appendChild(cell);
        }
    }


    gbl_cells = document.querySelectorAll('.cell');
}


/* EVENT LISTENERS */

function addGridSizeSliderEventListeners() {
    const gridSizeSlider = document.querySelector('#gridSizeSlider');

    gridSizeSlider.addEventListener('input', () => {
        gbl_gridSize = gridSizeSlider.value;
        setGridSizeLabel();
    });
    gridSizeSlider.addEventListener('change', () => {
        generateGrid();
    });
}

function addColorOptionsEventListeners() {
    const colorOptions = document.querySelectorAll('.color-options button');

    colorOptions.forEach((colorOption) => {
        colorOption.addEventListener('click', () => {
            gbl_currentColorOption.classList.remove('selected');
            gbl_currentColorOption = colorOption;
            gbl_currentColorOption.classList.add('selected');
        });
    });
}

function addShowGridBtnEventListeners() {
    const showGridBtn = document.querySelector('#show-grid-btn');

    showGridBtn.addEventListener('click', () => {
        if (gbl_gridVisible) {
            gbl_gridVisible = false;
            showGridBtn.classList.remove('selected');
            gbl_cells.forEach((cell) => {
                cell.classList.remove('grid-visible');
            });
        }
        else {
            gbl_gridVisible = true;
            showGridBtn.classList.add('selected');
            gbl_cells.forEach((cell) => {
                cell.classList.add('grid-visible');
            });
        }
    });
}

function addClearBtnEventListeners() {
    const clearBtn = document.querySelector('#clear-btn');

    clearBtn.addEventListener('click', () => {
        // Button clicked visual effect
        clearBtn.className = 'clear';
        setTimeout(() => {
            clearBtn.className = '';
        }, 70);
        
        // Clear grid
        gbl_cells.forEach((cell) => {
            cell.style.backgroundColor = '';
        });
    });
}

function setupColorPicker() {
    const colorInput = document.querySelector('input[type=color]');
    const colorPickerDiv = document.querySelector('.color-picker');

    colorInput.addEventListener('input', () => {
        colorPickerDiv.style.backgroundColor = colorInput.value;
        gbl_currentColor = colorInput.value;
    });
    colorPickerDiv.addEventListener('click', () => {
        colorInput.click();
    });
}

function addCellEventListeners() {
    ['mouseover', 'mousedown'].forEach((mouseAction) => {
        gbl_cells.forEach((cell) => {
            cell.addEventListener(mouseAction, (e) => {
                if (e.buttons == 1 || e.buttons == 3)
                    paint(cell);
            }); 
        });
    });
}


/* HELPER FUNCTIONS */

function setGridSizeLabel() {
    const gridSizeLabel = document.querySelector('label');
    gridSizeLabel.textContent = `${gbl_gridSize} x ${gbl_gridSize}`;
}

function paint(cell) {
    const currentColorOptionId = '#'+gbl_currentColorOption.id;
    let rgb;

    switch(currentColorOptionId) {
    case '#color-btn':
        cell.style.backgroundColor = gbl_currentColor;
        break;
    case '#rainbow-btn':
        cell.style.backgroundColor = getRainbowColor();
        break;
    case '#shading-btn':
        rgb = getRgbArray(cell.style.backgroundColor);
        cell.style.backgroundColor = `rgb(${rgb[0]-gbl_shadingValue}, ${rgb[1]-gbl_shadingValue}, ${rgb[2]-gbl_shadingValue})`;
        break;
    case '#lighten-btn':
        rgb = getRgbArray(cell.style.backgroundColor);
        cell.style.backgroundColor = `rgb(${rgb[0]+gbl_shadingValue}, ${rgb[1]+gbl_shadingValue}, ${rgb[2]+gbl_shadingValue})`;
        break;
    case '#eraser-btn':
        cell.style.backgroundColor = '';
    }
}

function getRgbArray(rgb) {
    if (!rgb)
	    rgb = '255,255,255';
    return rgb.replace(/[^\d,]/g, '').split(',').map((v) => Number(v));
}

// Generate a random color that's not too dark nor too bright
function getRainbowColor() {
    const rainbowColor = {};
    let baseColors = ['red', 'green', 'blue'];
    shuffleArray(baseColors);

    const totalColorValues = Math.floor(Math.random() * 500) + 170;
    const color1 = getRainbowValue(totalColorValues);
    rainbowColor[baseColors.pop()] = color1;
    const color2 = getRainbowValue(totalColorValues, color1);
    rainbowColor[baseColors.pop()] = color2;
    rainbowColor[baseColors.pop()] = totalColorValues - color1 - color2;
    
    return `rgb(${rainbowColor.red}, ${rainbowColor.green}, ${rainbowColor.blue})`;
}

function getRainbowValue(totalColorValues, color1 = 0) {
    let color = Math.floor(Math.random() * totalColorValues - color1);
    if (color > 255)
        color = 225;
    return color;
}

function shuffleArray(array) {
    // Durstenfeld shuffling algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}