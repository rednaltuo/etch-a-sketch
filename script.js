const MODE = Object.freeze({
    COLOR: 'color-btn',
    RAINBOW: 'rainbow-btn',
    SHADING: 'shading-btn',
    LIGHTEN: 'lighten-btn',
    ERASER: 'eraser-btn'
});

// Global variables
let gbl_gridSize;               
let gbl_currentColor;         
let gbl_gridVisible;
let gbl_shadingValue;
let gbl_grabbingColor;  
let gbl_currentColorOption;

let grid;

initialize();


function initialize() {
    setDefaults();

    grid = document.querySelector('.grid');
    generateGrid();

    addGridSizeEventListeners();
    addColorOptionsEventListeners();
    addShowGridEventListeners();
    addGrabColorEventListeners();
    addClearEventListeners();
    addColorPickerEventListeners();
}

function setDefaults() {
    gbl_gridSize = 16;
    gbl_currentColor = '#333333';
    gbl_gridVisible = false;
    gbl_shadingValue = 255 / 15;
    gbl_grabbingColor = false;

    gbl_currentColorOption = document.querySelector('#color-btn');
    gbl_currentColorOption.classList.add('selected');
    
    setGridSizeLabel();
}

function generateGrid() {
    grid.style.height = `${window.innerHeight * 0.8}px`;
    grid.style.width = grid.style.height;

    grid.replaceChildren();
    generateCells();
    addGridEventListeners();
}

function generateCells() {
    for (let i = 0; i < gbl_gridSize; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        grid.appendChild(row);
        for (let j = 0; j < gbl_gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            row.appendChild(cell);
        }
    }
}


/* EVENT LISTENERS */

function addGridEventListeners() {
    ['mouseover', 'mousedown'].forEach((mouseAction) => {
        grid.addEventListener(mouseAction, (e) => {
            if (gbl_grabbingColor)
                return;
            if (e.buttons == 1 || e.buttons == 3)
                paint(e.target);
        }); 
    });
}

function addGridSizeEventListeners() {
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
    const colorOptions = document.querySelector('.color-options');

    colorOptions.addEventListener('click', (e) => {
        if (gbl_grabbingColor || e.target.nodeName?.toLowerCase() != 'button')
            return;

        gbl_currentColorOption.classList.remove('selected');
        gbl_currentColorOption = e.target;
        gbl_currentColorOption.classList.add('selected');

        setGridCursor();
    });
}

function addShowGridEventListeners() {
    const showGridBtn = document.querySelector('#show-grid-btn');

    showGridBtn.addEventListener('click', () => {
        if (gbl_gridVisible) {
            gbl_gridVisible = false;
            showGridBtn.classList.remove('selected');
            grid.classList.remove('visible');
        }
        else {
            gbl_gridVisible = true;
            showGridBtn.classList.add('selected');
            grid.classList.add('visible');
        }
    });
}

function addGrabColorEventListeners() {
    const grabColorBtn = document.querySelector('#grab-btn');

    grabColorBtn.addEventListener('click', () => {
        if (gbl_grabbingColor) {
            gbl_grabbingColor = false;
            setGridCursor();
            grabColorBtn.classList.remove('selected');
            gbl_currentColorOption.classList.add('selected');
        }
        else {
            gbl_grabbingColor = true;
            setGridCursor();
            grabColorBtn.classList.add('selected');
            gbl_currentColorOption.classList.remove('selected');
        }
    });

    grid.addEventListener('click', (e) => {
        if (gbl_grabbingColor) {
            gbl_grabbingColor = false;
            grabColorBtn.classList.remove('selected');
            grid.classList.remove('grabbing-color');

            const colorInput = document.querySelector('input[type=color]');
            const colorPickerDiv = document.querySelector('.color-picker');
            let colorPicked = e.target.style.backgroundColor ;
            colorPicked = colorPicked.match(/[0-9]+/g)?.reduce((a, b) => a+(b|256).toString(16).slice(1), '#') ?? '#FFFFFF';
            colorInput.value = colorPicked;
            colorPickerDiv.style.backgroundColor = colorPicked;

            gbl_currentColor = colorPicked;
            gbl_currentColorOption = document.querySelector('#'+MODE.COLOR);
            gbl_currentColorOption.classList.add('selected');
            setGridCursor()
        }
    });
}

function addClearEventListeners() {
    const clearBtn = document.querySelector('#clear-btn');

    clearBtn.addEventListener('click', () => {
        // Button clicked visual effect
        clearBtn.className = 'clear';
        setTimeout(() => {
            clearBtn.className = 'clear-complete';
        }, 100);
        
        // Clear grid
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell) => {
            cell.style.backgroundColor = '';
        });
    });
}

function addColorPickerEventListeners() {
    const colorInput = document.querySelector('input[type=color]');
    const colorPickerDiv = document.querySelector('.color-picker');

    colorPickerDiv.style.backgroundColor = gbl_currentColor;
    colorInput.value = gbl_currentColor;

    colorInput.addEventListener('input', () => {
        colorPickerDiv.style.backgroundColor = colorInput.value;
        gbl_currentColor = colorInput.value;
    });
    colorPickerDiv.addEventListener('click', () => {
        colorInput.click();
    });
}


/* HELPER FUNCTIONS */

function setGridSizeLabel() {
    const gridSizeLabel = document.querySelector('label');
    gridSizeLabel.textContent = `${gbl_gridSize} x ${gbl_gridSize}`;
}

function setGridCursor() {
    if (gbl_grabbingColor) {
        grid.classList.add('grabbing-color');
        return;
    }
    switch (gbl_currentColorOption.id) {
    case MODE.RAINBOW:
        grid.className = 'grid rainbow-painting';
        break;
    case MODE.ERASER:
        grid.className = 'grid erasing';
        break;
    default:
        grid.className = 'grid painting';
    }
    if (gbl_gridVisible)
        grid.classList.add('visible');
}

function paint(cell) {
    const currentColorOptionId = gbl_currentColorOption.id;

    switch(currentColorOptionId) {
    case MODE.COLOR:
        cell.style.backgroundColor = gbl_currentColor;
        break;
    case MODE.RAINBOW:
        cell.style.backgroundColor = getRainbowColor();
        break;
    case MODE.SHADING:
    case MODE.LIGHTEN:
        cell.style.backgroundColor = calculateShadedRgb(cell.style.backgroundColor, currentColorOptionId);
        break;
    case MODE.ERASER:
        cell.style.backgroundColor = '';
    }
}

function calculateShadedRgb(rgb, mode) {
    if (!rgb)
	    rgb = '255,255,255';
    rgb = rgb.replace(/[^\d,]/g, '').split(',').map((v) => Number(v));
    if (mode == MODE.SHADING)
        return `rgb(${rgb[0] - gbl_shadingValue}, ${rgb[1] - gbl_shadingValue}, ${rgb[2] - gbl_shadingValue})`
    return `rgb(${rgb[0] + gbl_shadingValue}, ${rgb[1] + gbl_shadingValue}, ${rgb[2] + gbl_shadingValue})`;

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