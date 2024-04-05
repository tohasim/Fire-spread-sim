"use strict";

//#region CONTROLLER
window.addEventListener("load", start);

//Burn constants
const BURNRATE_GRASS = 1;
const BURNRATE_BUSH = 5;
const BURNRATE_TREE = 10;
const IGNITION_PROBABILITY = 0.6;

//Grid variables
const GRID_ROWS = 50;
const GRID_COLS = 100;
let model = null;

//Timeout variables
const tickTimer = 500;
let shouldTick = false;
let tickTimeout = null;

function start() {
	//Initialize model and view
	model = new Grid(GRID_ROWS, GRID_COLS);
	setupBoard();
	showBoard();
}

function tick() {
	// setup next tick
	if (shouldTick) tickTimeout = setTimeout(tick, tickTimer);
	// update model
	model.calculateNextGen();
	// show new state
	showBoard();
}
//#endregion

//#region VIEW
function setupBoard() {
	//Get board
	const board = document.getElementById("board");
	//Reset it
	board.innerHTML = "";
	//Make board clickable and add the --GRID_COLS variable
	board.addEventListener("click", (event) => boardClicked(event));
	board.style.setProperty("--GRID_COLS", GRID_COLS);
	//Loop through grid
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLS; j++) {
			//Create child element with correct classes/data attributes
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.setAttribute("data-index", i * GRID_COLS + j);
			setCellClass(cell, model.cells[i][j].state);
			board.appendChild(cell);
		}
	}
}

function showBoard() {
	//Get all cells
	const cells = document.querySelectorAll(".cell");
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLS; j++) {
			const cell = cells[i * GRID_COLS + j];
			//Show current cell with correct state from model
			setCellClass(cell, model.cells[i][j].state);
		}
	}
}

function setCellClass(cell, state) {
	// add state to cell
	cell.className = "cell " + state;
}

function boardClicked(event) {
	//Get clicked element, and check whether it's a cell (avoid event-bubbling)
	let cell = event.target;
	if (cell.classList.contains("cell")) {
		//Enable ticking
		shouldTick = true;
		//Reset tick timeout
		clearTimeout(tickTimeout);
		//Get index, row and col variables
		const index = cell.dataset.index;
		const row = Math.floor(index / GRID_COLS);
		const col = index % GRID_COLS;
		//Set cell on fire in Model
		model.cells[row][col].state = "fire";
		//Show new state on View and start loop
		showBoard();
		tick();
	}
}

//#endregion

//#region MODEL

//Simple cell class with the current state and hp
class Cell {
	constructor(state, hp = 0) {
		this.state = state;
		this.hp = hp;
	}
}

//Grid class for the model
class Grid {
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.cells = [];
		//Fill grid with elements
		this.init();
	}

	init() {
		for (let i = 0; i < this.rows; i++) {
			const row = [];
			for (let j = 0; j < this.cols; j++) {
				//Randomly add states
				const state =
					Math.random() < 0.7 ? "grass" : Math.random() < 0.5 ? "bush" : "tree";
				//Set the hp of the cell
				const hp =
					state === "grass"
						? BURNRATE_GRASS
						: state === "bush"
						? BURNRATE_BUSH
						: BURNRATE_TREE;
				//Add cell to current row
				row.push(new Cell(state, hp));
			}
			//Add current row to model
			this.cells.push(row);
		}
	}

	calculateNextGen() {
		const newCells = [];
		for (let i = 0; i < this.rows; i++) {
			const newRow = [];
			for (let j = 0; j < this.cols; j++) {
				const cell = this.cells[i][j];
				//Use helper method to update the cell
				newRow.push(this.updateCellState(cell, i, j));
			}
			newCells.push(newRow);
		}
		//Replace old cell list with new
		this.cells = newCells;
	}

	updateCellState(cell, row, col) {
		//Get all neighbors
		const neighborStates = this.getNeighborStates(row, col);
		//Initialize newState variable with the cells current state
		let newState = cell.state;
		//If cell is on fire its hp should decrease
		if (cell.state === "fire") {
			cell.hp--;
			//If cell's hp reaches 0, it burns out (like a programmer at netcompany :) )
			if (cell.hp <= 0) {
				newState = "burned";
			}
		}
		//If cell is neither burning nor on fire
		if (cell.state !== "burned" && cell.state !== "fire") {
			//If one of the neighboring cells is on fire, the current cell should catch on fire (some of the time)
			if (
				neighborStates.includes("fire") &&
				Math.random() < IGNITION_PROBABILITY
			) {
				//Update newState variable
				newState = "fire";
			}
		}
		//Return updated cell
		return new Cell(newState, cell.hp);
	}

	getNeighborStates(row, col) {
		const states = [];
		//Loop through immidate neighbors (N, NE, E, SE, S, SW, W, NW)
		for (let i = row - 1; i <= row + 1; i++) {
			for (let j = col - 1; j <= col + 1; j++) {
				//Check whether the index is in bounds
				if (
					i >= 0 &&
					i < this.rows &&
					j >= 0 &&
					j < this.cols &&
					!(i === row && j === col)
				) {
					//Add state to states
					states.push(this.cells[i][j].state);
				}
			}
		}
		//Return list of neighbor states
		return states;
	}
}

//#endregion
