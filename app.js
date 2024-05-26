// Human-controlled variables
const cols = 60;
const rows = 60;
let margin = 1; // Margin between cells
let cellSize = 15 - margin; // Adjusted cell size to account for the margin

// Initial States (could be human-controlled, but don't change often)
const colorStep = 1;
let baseIntervalSpeed = 5; // Default speed set to 5 milliseconds
let colorTransition = false; // Rainbow effect off by default
let direction = 'down';
let trailLength = 20; // Initial tail length
const initialColor = [1, 236, 1]; // Initial color in rgba
let glowEffect = false; // Glow effect off by default

// Machine-controlled variables
let nodeSize = cellSize / 2; // Size of each node in pixels

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
            drawCell(col, row, (trailLength - j) / trailLength, false);
        }
    }

    // Draw leading cells
    for (let cell of selectedCells) {
        drawCell(cell.col, cell.row, 1, true);
    }
}

// Draw cell
function drawCell(col, row, opacity, isLeading) {
    let rgb;
    if (isLeading) {
        rgb = [255, 255, 255]; // White color for leading cell
    } else {
        rgb = colorTransition ? hslToRgb(hue / 360, 1, 0.5) : initialColor; // Shade of green for tail
    }
    const colors = [
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.75})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.5})`,
        `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.25})`
    ];

    if (glowEffect) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.75)`;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else {
        ctx.shadowBlur = 0;
    }

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

// Toggle glow effect
function toggleGlowEffect() {
    glowEffect = !glowEffect;
}

// Update margin
function updateMargin(event) {
    margin = parseInt(event.target.value, 10);
    cellSize = 15 - margin;
    nodeSize = cellSize / 2;
    canvas.width = cols * (cellSize + margin);
    canvas.height = rows * (cellSize + margin);
    trails = Array.from({ length: cols }, () => []); // Reset trails
    drawGrid(); // Redraw grid with new margin
}

// Event listeners
document.getElementById('startButton').addEventListener('click', toggleIteration);
document.getElementById('toggleColorButton').addEventListener('click', toggleColorTransition);
document.getElementById('directionButton').addEventListener('click', toggleDirection);
document.getElementById('toggleGlowButton').addEventListener('click', toggleGlowEffect);
document.getElementById('trailLengthInput').addEventListener('input', (event) => {
    trailLength = parseInt(event.target.value, 10);
    trails = Array.from({ length: cols }, () => []); // Reset trails
});
document.getElementById('marginInput').addEventListener('input', updateMargin);

// Initial draw
updateColors();
drawGrid();
