const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const cols = 50; // Number of columns in the grid
const rows = 50; // Number of rows in the grid
const cellSize = 50; // Size of each cell in pixels
const nodeSize = cellSize / 2; // Size of each node in pixels
const colorStep = 1; // Step for color change
const baseIntervalSpeed = 10; // Base milliseconds for the interval
let hue = 0; // Initial hue for the rainbow effect
let hueDirection = 1; // Direction for hue change (1 for forward, -1 for backward)
let position = 0; // Variable to keep track of position
let intervalId;
let selectedCells = []; // To store the current row for each column
let decayMap = []; // To store the decay state of each cell
let speeds = []; // To store the speed factor for each column
let colorTransition = true; // Variable to toggle color transition

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Initialize the selected cells with random row positions and speeds
for (let i = 0; i < cols; i++) {
    selectedCells.push({
        row: Math.floor(Math.random() * rows),
        col: i,
        speed: Math.random() * 0.4 + 0.6 // Speed factor between 0.6 and 1
    });
}

// Initialize decay map
for (let r = 0; r < rows; r++) {
    decayMap[r] = [];
    for (let c = 0; c < cols; c++) {
        decayMap[r][c] = 1; // Full opacity initially
    }
}

// Function to update the colors
function updateColors() {
    if (colorTransition) {
        hue += colorStep * hueDirection;
        if (hue >= 360 || hue <= 0) {
            hueDirection *= -1; // Reverse direction
        }
    }
}

// Function to draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (decayMap[r][c] < 1) {
                drawCell(c, r, decayMap[r][c]);
                decayMap[r][c] = Math.max(decayMap[r][c] - 0.02, 0); // Decay
            }
        }
    }

    for (let i = 0; i < selectedCells.length; i++) {
        let cell = selectedCells[i];
        drawCell(cell.col, cell.row, 1);
        decayMap[cell.row][cell.col] = 1; // Reset decay
    }
}

// Function to draw a cell with 4 nodes
function drawCell(col, row, opacity) {
    const rgb = hslToRgb(hue / 360, 1, 0.5);
    const colors = [
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.75})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.5})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.25})`
    ];

    const x = col * cellSize;
    const y = row * cellSize;
    const order = [0, 1, 3, 2]; // Pattern: 1, 2, 4, 3

    ctx.fillStyle = colors[(position + order[0]) % colors.length];
    ctx.fillRect(x, y, nodeSize, nodeSize);
    ctx.fillStyle = colors[(position + order[1]) % colors.length];
    ctx.fillRect(x + nodeSize, y, nodeSize, nodeSize);
    ctx.fillStyle = colors[(position + order[2]) % colors.length];
    ctx.fillRect(x, y + nodeSize, nodeSize, nodeSize);
    ctx.fillStyle = colors[(position + order[3]) % colors.length];
    ctx.fillRect(x + nodeSize, y + nodeSize, nodeSize, nodeSize);
}

// Function to update the position
function updatePosition() {
    fillPassedCells();

    for (let i = 0; i < selectedCells.length; i++) {
        if (Math.random() < selectedCells[i].speed) {
            selectedCells[i].row = (selectedCells[i].row + 1) % rows;
        }
    }
    position = (position + 1) % 4; // Rotate colors within the cell

    updateColors();
    drawGrid();
}

// Function to fill the cells it passed with decaying effect
function fillPassedCells() {
    for (let i = 0; i < selectedCells.length; i++) {
        const col = selectedCells[i].col;
        let prevRow = selectedCells[i].row - 1;
        if (prevRow < 0) prevRow = rows - 1;
        decayMap[prevRow][col] = Math.max(decayMap[prevRow][col] - 0.02, 0);
    }
}

// Function to start the iteration
function startIteration() {
    if (intervalId) {
        clearInterval(intervalId); // Clear any existing interval
    }
    intervalId = setInterval(updatePosition, baseIntervalSpeed); // Update position every baseIntervalSpeed milliseconds
}

// Function to stop the iteration
function stopIteration() {
    if (intervalId) {
        clearInterval(intervalId);
    }
}

// Function to toggle color transition
function toggleColorTransition() {
    colorTransition = !colorTransition;
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 3) return q;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Add event listeners to the buttons
document.getElementById('startButton').addEventListener('click', startIteration);
document.getElementById('stopButton').addEventListener('click', stopIteration);
document.getElementById('toggleColorButton').addEventListener('click', toggleColorTransition);

// Initial color update
updateColors();
drawGrid();


