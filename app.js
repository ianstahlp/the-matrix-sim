// Human-controlled variables
const cols = 80;
const rows = 60;
const cellSize = 15; // Adjusted cell size to account for the margin

// Initial States (could be human-controlled, but don't change often)
const margin = 0; // Margin between cells (not happy with this, don't increase or it will look bad)
const colorStep = 1;
let baseIntervalSpeed = 5; // Default speed set to 5 milliseconds
let colorTransition = true;
let direction = 'down';
let trailLength = 20; // Initial tail length

// Machine-controlled variables
const nodeSize = cellSize / 2; // Size of each node in pixels

let hue = 0;
let hueDirection = 1;
let position = 0;
let animationFrameId;
let lastUpdateTime = 0;
let selectedCells = [];
let decayMap = Array.from({ length: rows }, () => Array(cols).fill(1));
let trails = Array.from({ length: cols }, () => []); // Store previous positions for each node

// Canvas setup
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
canvas.width = cols * (cellSize + margin);
canvas.height = rows * (cellSize + margin);

// Initialize selected cells
for (let i = 0; i < cols; i++) {
    selectedCells.push({
        row: Math.floor(Math.random() * rows),
        col: i,
        speed: Math.random() * 0.4 + 0.6
    });
}

// Update colors
function updateColors() {
    if (colorTransition) {
        hue += colorStep * hueDirection;
        if (hue >= 360 || hue <= 0) {
            hueDirection *= -1;
        }
    }
}

// Draw grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw trails
    for (let i = 0; i < trails.length; i++) {
        for (let j = 0; j < trails[i].length; j++) {
            const { col, row } = trails[i][j];
            drawCell(col, row, (trailLength - j) / trailLength);
        }
    }

    // Draw leading cells
    for (let cell of selectedCells) {
        drawCell(cell.col, cell.row, 1);
    }
}

// Draw cell
function drawCell(col, row, opacity) {
    const rgb = hslToRgb(hue / 360, 1, 0.5);
    const colors = [
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.75})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.5})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.25})`
    ];

    const x = col * (cellSize + margin);
    const y = row * (cellSize + margin);
    const order = [0, 1, 3, 2];

    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[(position + order[i]) % colors.length];
        ctx.fillRect(x + (i % 2) * (nodeSize), y + Math.floor(i / 2) * (nodeSize), nodeSize, nodeSize);
    }
}

// Update position
function updatePosition(timestamp) {
    if (timestamp - lastUpdateTime < baseIntervalSpeed) {
        animationFrameId = requestAnimationFrame(updatePosition);
        return;
    }

    lastUpdateTime = timestamp;

    for (let i = 0; i < selectedCells.length; i++) {
        let cell = selectedCells[i];
        let prevRow = cell.row;
        let prevCol = cell.col;

        if (Math.random() < cell.speed) {
            if (direction === 'down') cell.row = (cell.row + 1) % rows;
            if (direction === 'up') cell.row = (cell.row - 1 + rows) % rows;
            if (direction === 'right') cell.col = (cell.col + 1) % cols;
            if (direction === 'left') cell.col = (cell.col - 1 + cols) % cols;
        }

        // Add previous position to trail
        trails[i].unshift({ col: prevCol, row: prevRow });
        if (trails[i].length > trailLength) {
            trails[i].pop();
        }
    }
    position = (position + 1) % 4;

    updateColors();
    drawGrid();
    animationFrameId = requestAnimationFrame(updatePosition);
}

// Toggle iteration
function toggleIteration() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        document.getElementById('startButton').textContent = 'Start';
    } else {
        lastUpdateTime = performance.now();
        animationFrameId = requestAnimationFrame(updatePosition);
        document.getElementById('startButton').textContent = 'Stop';
    }
}

// Toggle color transition
function toggleColorTransition() {
    colorTransition = !colorTransition;
}

// Toggle direction
function toggleDirection() {
    const directions = ['down', 'left', 'up', 'right']; // Updated direction order
    let currentIndex = directions.indexOf(direction);
    direction = directions[(currentIndex + 1) % directions.length];
    document.getElementById('directionButton').textContent = `Direction: ${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
}

// Event listeners
document.getElementById('startButton').addEventListener('click', toggleIteration);
document.getElementById('toggleColorButton').addEventListener('click', toggleColorTransition);
document.getElementById('directionButton').addEventListener('click', toggleDirection);
document.getElementById('trailLengthInput').addEventListener('input', (event) => {
    trailLength = parseInt(event.target.value, 10);
    trails = Array.from({ length: cols }, () => []); // Reset trails
});

// Initial draw
updateColors();
drawGrid();
