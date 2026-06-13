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
	ReferenceIsLink = 12,
	Conditions = 13,
	Notes = 14,
	DeleteButton = 15
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
	let newRow = document.createElement("tr") as HTMLTableRowElement;
	newRow.className = Creature.getTeamStyles(creature);
	newRow.classList.toggle("down", (Creature.getRemainingHp(creature) ?? 1) <= 0);

	let nameCell = document.createElement("td") as HTMLTableCellElement;
	nameCell.contentEditable = "true";
	nameCell.innerText = creature.name;
	nameCell.addEventListener("input", () => {
		creature.name = nameCell.innerText;
		saveData();
	});

	let teamCell = document.createElement("td") as HTMLTableCellElement;
	let teamSelect = document.createElement("select") as HTMLSelectElement;
	for (let team in Team) {
		if (!isNaN(Number(team)))
		{
			let option = document.createElement("option") as HTMLOptionElement;
			option.value = team;
			option.text = Team[team];
			teamSelect.appendChild(option);
		}
	}
	teamSelect.value = creature.team.toString();
	teamSelect.addEventListener("change", () => {
		creature.team = parseInt(teamSelect.value) as Team;
		saveData();
	});
	teamCell.appendChild(teamSelect);

	let initiativeRollCell = document.createElement("td") as HTMLTableCellElement;
	let initiativeRollField = document.createElement("input") as HTMLInputElement;
	initiativeRollField.type = "number";
	initiativeRollField.value = creature.initiativeRoll?.toString() ?? "";
	initiativeRollField.addEventListener("input", () => {
		creature.initiativeRoll = initiativeRollField.value == "" || isNaN(initiativeRollField.valueAsNumber) ? null : initiativeRollField.valueAsNumber;
		saveData();
	});
	initiativeRollCell.appendChild(initiativeRollField);

	let initiativeModifierCell = document.createElement("td") as HTMLTableCellElement;
	let initiativeModifierField = document.createElement("input") as HTMLInputElement;
	initiativeModifierField.type = "number";
	initiativeModifierField.value = creature.initiativeModifier.toString();
	initiativeModifierField.addEventListener("input", () => {
		let value = initiativeModifierField.valueAsNumber;
		if (isNaN(value)) return;
		creature.initiativeModifier = value;
		saveData();
	});
	initiativeModifierCell.appendChild(initiativeModifierField);

	let armorClassCell = document.createElement("td") as HTMLTableCellElement;
	let armorClassField = document.createElement("input") as HTMLInputElement;
	armorClassField.type = "number";
	armorClassField.value = creature.armorClass.toString();
	armorClassField.addEventListener("input", () => {
		let value = armorClassField.valueAsNumber;
		if (isNaN(value)) return;
		creature.armorClass = value;
		saveData();
	});
	armorClassCell.appendChild(armorClassField);

	let remainingHpCell = document.createElement("td") as HTMLTableCellElement;
	remainingHpCell.innerText = Creature.getRemainingHp(creature)?.toString() ?? "-";

	let maxHpCell = document.createElement("td") as HTMLTableCellElement;
	let maxHpField = document.createElement("input") as HTMLInputElement;
	maxHpField.type = "number";
	maxHpField.value = creature.maxHp?.toString() ?? "-";
	maxHpField.addEventListener("input", () => {
		creature.maxHp = maxHpField.value == "" || isNaN(maxHpField.valueAsNumber) ? null : maxHpField.valueAsNumber;
		saveData();
	});
	maxHpCell.appendChild(maxHpField);

	let damageTakenCell = document.createElement("td") as HTMLTableCellElement;
	damageTakenCell.innerText = creature.damageTaken.toString();

	let damageToInflictCureCell = document.createElement("td") as HTMLTableCellElement;
	let damageToInflictCureField = document.createElement("input") as HTMLInputElement;
	damageToInflictCureField.type = "number";
	damageToInflictCureField.className = "damageToInflictCure";
	damageToInflictCureCell.appendChild(damageToInflictCureField);

	let inflictCell = document.createElement("td") as HTMLTableCellElement;
	let inflictButton = document.createElement("button") as HTMLButtonElement;
	inflictButton.innerText = "Inflict";
	inflictButton.className = "inflict";
	inflictButton.addEventListener("click", () => {
		let value = damageToInflictCureField.valueAsNumber;
		if (isNaN(value)) {
			return;
		}
		Creature.inflictWounds(creature, value);
		damageTakenCell.innerText = creature.damageTaken.toString();
		damageToInflictCureField.value = "";
		let hp = Creature.getRemainingHp(creature);
		remainingHpCell.innerText = hp?.toString() ?? "-";
		newRow.classList.toggle("down", hp != null && hp <= 0);
		saveData();
	});
	inflictCell.appendChild(inflictButton);

	let cureCell = document.createElement("td") as HTMLTableCellElement;
	let cureButton = document.createElement("button") as HTMLButtonElement;
	cureButton.innerText = "Cure";
	cureButton.className = "cure";
	cureButton.addEventListener("click", () => {
		let value = damageToInflictCureField.valueAsNumber;
		if (isNaN(value)) {
			return;
		}
		Creature.cureWounds(creature, value);
		damageTakenCell.innerText = creature.damageTaken.toString();
		damageToInflictCureField.value = "";
		remainingHpCell.innerText = Creature.getRemainingHp(creature)?.toString() ?? "-";
		let hp = Creature.getRemainingHp(creature);
		remainingHpCell.innerText = hp?.toString() ?? "-";
		newRow.classList.toggle("down", hp != null && hp <= 0);
		saveData();
	});
	cureCell.appendChild(cureButton);

	newRow.appendChild(nameCell);
	newRow.appendChild(teamCell);
	newRow.appendChild(initiativeRollCell);
	newRow.appendChild(initiativeModifierCell);
	newRow.appendChild(armorClassCell);
	newRow.appendChild(remainingHpCell);
	newRow.appendChild(maxHpCell);
	newRow.appendChild(damageTakenCell);
	newRow.appendChild(damageToInflictCureCell);
	newRow.appendChild(inflictCell);
	newRow.appendChild(cureCell);
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