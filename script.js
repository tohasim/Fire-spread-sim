"use strict";

//#region CONTROLLER
window.addEventListener("load", start);
const GRID_ROWS = 30;
const GRID_COLS = 50;
const tickTimer = 500;

let shouldTick = false;
let tickTimeout = null;

function start() {
	setupModel();
	setupBoard();
	showBoard();
	if (shouldTick) tick();
}

function tick() {
	// setup next tick
	if (shouldTick) tickTimeout = setTimeout(tick, tickTimer);

	// update model
	calculateNextGen();

	// show new state
	showBoard();
}
function calculateNextGen() {
	const newModel = [];
	for (let i = 0; i < GRID_ROWS; i++) {
		const newRow = [];
		for (let j = 0; j < GRID_COLS; j++) {
			switch (model[i][j]) {
				case FIRE:
					// Fire burns out, becomes burned
					newRow.push(BURNED);
					break;
				case GRASS:
				case TREE:
				case BUSH:
					// Check if any nearby cell is on fire with some randomness
					let hasFireNeighbor = false;
					const spreadRadius = 2; // Radius of circular spread
					const noiseThreshold = 0.4; // Threshold for noise
					for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
						for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
							const newRowPos = i + dx;
							const newColPos = j + dy;
							// Ensure neighbor cell is within bounds
							if (
								newRowPos >= 0 &&
								newRowPos < GRID_ROWS &&
								newColPos >= 0 &&
								newColPos < GRID_COLS
							) {
								// Check if neighbor cell is on fire with some randomness
								if (
									model[newRowPos][newColPos] === FIRE &&
									Math.random() < noiseThreshold
								) {
									hasFireNeighbor = true;
									break;
								}
							}
						}
						if (hasFireNeighbor) break;
					}
					// If adjacent cell is on fire with randomness, grass catches fire
					if (hasFireNeighbor) {
						newRow.push(FIRE);
					} else {
						newRow.push(model[i][j]);
					}
					break;
				default:
					// Copy existing state for burned, bush, and tree cells
					newRow.push(model[i][j]);
					break;
			}
		}
		newModel.push(newRow);
	}
	// Update the model with the new generation
	model.length = 0; // Clear the existing model
	for (let i = 0; i < newModel.length; i++) {
		model.push(newModel[i].slice()); // Copy new generation to model
	}
}

//#endregion

//#region VIEW
function setupBoard() {
	const board = document.getElementById("board");
	board.innerHTML = "";
	board.addEventListener("click", (event) => boardClicked(event));
	board.style.setProperty("--GRID_COLS", GRID_COLS);
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLS; j++) {
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.setAttribute("data-index", i * GRID_COLS + j);
			setCellClass(cell, i, j);
			board.appendChild(cell);
		}
	}
}
function showBoard() {
	const cells = document.querySelectorAll(".cell");
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLS; j++) {
			const cell = cells[i * GRID_COLS + j];
			setCellClass(cell, i, j);
		}
	}
}

function setCellClass(cell, i, j) {
	switch (model[i][j]) {
		case FIRE:
			cell.classList = ["cell"];
			cell.classList.add("fire");
			break;
		case BURNED:
			cell.classList = ["cell"];
			cell.classList.add("burned");
			break;
		case GRASS:
			cell.classList = ["cell"];
			cell.classList.add("grass");
			break;
		case BUSH:
			cell.classList = ["cell"];
			cell.classList.add("bush");
			break;
		case TREE:
			cell.classList = ["cell"];
			cell.classList.add("tree");
			break;
	}
}

//#endregion

//#region MODEL

// setup state constants
const GRASS = 10;
const BUSH = 11;
const TREE = 12;
const BURNED = 0;
const FIRE = 1;

const model = [];
function setupModel() {
	for (let i = 0; i < GRID_ROWS; i++) {
		const row = [];
		for (let j = 0; j < GRID_COLS; j++) {
			let randomNumber = Math.floor(Math.random() * 10) + 1;
			if (randomNumber < 7) {
				row.push(GRASS);
			} else if (randomNumber > 6 && randomNumber < 10  ) {
				row.push(BUSH);

			} else {
				row.push(TREE)
			}
			
		}
		model.push(row);
	}
}

function boardClicked(event) {
	shouldTick = true;
	clearTimeout(tickTimeout);
	let cell = event.target;
	if (cell.classList.contains("cell")) {
		const index = cell.dataset.index;
		model[Math.floor(index / GRID_COLS)][index % GRID_COLS] = FIRE;
		showBoard();
	}
	tick();
}

//#endregion
