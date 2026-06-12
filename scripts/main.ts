enum Columns {
	Name = 0,
	Team = 1,
	InitiativeRoll = 2,
	InitiativeModifier = 3,
	ArmorClass = 4,
	RemainingHp = 5,
	MaxHp = 6,
	DamageTaken = 7,
	DamageToInflictCure = 8,
	InflictButton = 9,
	CureButton = 10,
	Reference = 11,
	Conditions = 12,
	Notes = 13,
	DeleteButton = 14
}

const CREATURES_SAVE_KEY = "InitiativeTrackerCreatures";
const OPTIONS_SAVE_KEY = "InitiativeTrackerOptions";

const CharacterListElement = document.getElementById("CharacterList") as HTMLTableSectionElement;

let creatures: { [id: string]: Creature } = {};
let options = { turnIndex: 0, sortByInitiative: false };

loadData();

function loadData() {
	let savedCreatures = localStorage.getItem(CREATURES_SAVE_KEY);
	if (savedCreatures) { creatures = JSON.parse(savedCreatures); }

	let savedOptions = localStorage.getItem(OPTIONS_SAVE_KEY);
	if (savedOptions) { options = JSON.parse(savedOptions); }

	for (let id in creatures) {
		addRow(creatures[id]);
	}
}

function saveData() {
	localStorage.setItem(CREATURES_SAVE_KEY, JSON.stringify(creatures));
	localStorage.setItem(OPTIONS_SAVE_KEY, JSON.stringify(options));
}

function addRow(creature: Creature) {
	let newRow = document.createElement("tr");

	let nameCell = document.createElement("td");
	nameCell.contentEditable = "true";
	nameCell.innerText = creature.name;
	nameCell.addEventListener("input", () => {
		creature.name = nameCell.innerText;
		saveData();
	});

	newRow.appendChild(nameCell);
	CharacterListElement.appendChild(newRow);
}

function addCreature() {
	while (Object.keys(creatures).includes(Creature.autoIncrement.toString())) {
		Creature.autoIncrement++;
	}

	let id = (Creature.autoIncrement++).toString();
	creatures[id] = new Creature(id);

	saveData();

	addRow(creatures[id]);
}