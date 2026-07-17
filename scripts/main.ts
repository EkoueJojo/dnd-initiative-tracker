const SAVE_KEY = "InitiativeTracker";
const EXPORT_FILENAME = "DndInitiativeExport.json";

const SORT_BY_INITIATIVE_ICON = "fa-solid fa-arrow-down-9-1";
const SORT_BY_TEAM_ICON = "fa-solid fa-arrow-down-a-z";
const EDIT_ICON = "fa-solid fa-pen-to-square";
const DUPLICATE_ICON = "fa-solid fa-clone";
const DELETE_ICON = "fa-solid fa-trash";

const ROW_ID_PREFIX = "CharacterRow_";

const CURRENT_TURN_CLASS_NAME = "currentTurn";
const DOWN_CLASS_NAME = "down";
const WOUNDS_TO_INFLICT_CURE_CLASS_NAME = "woundsToInflictCure";
const INFLICT_CLASS_NAME = "inflict";
const CURE_CLASS_NAME = "cure";
const SET_TEMPORARY_CLASS_NAME = "temporaryHp";
const INACTIVE_LINK_CLASS_NAME = "inactiveLink";
const HIDDEN_CLASS_NAME = "hidden";
const LIST_STYLE_CLASS_NAME = "listStyle";
const DUPLICATE_BUTTON_CLASS_NAME = "duplicateButton";
const DELETE_BUTTON_CLASS_NAME = "deleteButton";

const INFLICT_BUTTON_TEXT = "Inflict";
const CURE_BUTTON_TEXT = "Cure";
const SET_TEMPORARY_BUTTON_TEXT = "Temp";
const EMPTY_VALUE_TEXT = "-";
const REFERENCE_FIELD_TEXT = "Display Name";
const REFERENCE_URL_FIELD_TEXT = "URL";
const SORT_BY_INITIATIVE_TEXT = "Sort by initiative roll and dexterity";
const SORT_BY_TEAM_TEXT = "Sort by team and name";

const CharacterListElement = document.getElementById("CharacterList") as HTMLTableSectionElement;
const SortButton = document.getElementById("SortButton") as HTMLButtonElement;
const ImportDataFileInput = document.getElementById("ImportDataFileInput") as HTMLInputElement;
const ImportErrorContainer = document.getElementById("ImportErrorContainer") as HTMLDivElement;

let creatures: { [id: string]: Creature } = {};
let options = { turnIndex: 0, sortByInitiative: false };

loadData();

function getSortedCreatureIds(byInitiative: boolean = false) {
	let compareTo = options.sortByInitiative || byInitiative ? Creature.compareInitiativeTo : Creature.compareTo;
	return Object.keys(creatures).sort((keyA, keyB) => compareTo(creatures[keyA], creatures[keyB]));
}

function highlightCurrentTurn() {
	for (const element of document.getElementsByClassName(CURRENT_TURN_CLASS_NAME)) {
		element.classList.remove(CURRENT_TURN_CLASS_NAME);
	}

	let sortedCreatures = getSortedCreatureIds(true);
	let upCreatures = sortedCreatures.filter(id => creatures[id].initiativeRoll != null && (Creature.getRemainingHp(creatures[id]) ?? 1) > 0);

	if (upCreatures.length == 0) {
		options.turnIndex = 0;
	}
	else {
		while (!upCreatures.includes(sortedCreatures[options.turnIndex])) {
			options.turnIndex++;
			options.turnIndex %= sortedCreatures.length;
		}
	}

	document.getElementById(ROW_ID_PREFIX + sortedCreatures[options.turnIndex])?.firstElementChild?.classList.add(CURRENT_TURN_CLASS_NAME);
}

function loadData() {
	let savedData = localStorage.getItem(SAVE_KEY);

	if (savedData) {
		let parsedData = JSON.parse(savedData) as { creatures: typeof creatures, options: typeof options };
		creatures = parsedData.creatures;
		options = parsedData.options;
	}

	updateSortButton();

	for (let id of getSortedCreatureIds()) {
		addRow(creatures[id], true);
	}

	highlightCurrentTurn();
}

function serializedData() {
	return JSON.stringify({ creatures: creatures, options: options });
}

function saveData() {
	localStorage.setItem(SAVE_KEY, serializedData());
}

function findCreatureSortedIndex(creature: Creature) {
	return getSortedCreatureIds().indexOf(creature.id);
}

function reinsertRow(row: HTMLTableRowElement, creature: Creature, resetTurn = true) {
	CharacterListElement.removeChild(row);
	CharacterListElement.insertBefore(row, CharacterListElement.children[findCreatureSortedIndex(creature)]);

	if (resetTurn) {
		options.turnIndex = 0;
		saveData();
		highlightCurrentTurn();
	}
}

function addRow(creature: Creature, append: boolean = false) {
	let newRow = CharacterListElement.insertRow(append ? -1 : findCreatureSortedIndex(creature));
	newRow.id = ROW_ID_PREFIX + creature.id;

	newRow.className = Creature.getTeamStyle(creature);
	newRow.classList.toggle(DOWN_CLASS_NAME, (Creature.getRemainingHp(creature) ?? 1) <= 0);

	let nameCell = document.createElement("td") as HTMLTableCellElement;
	nameCell.contentEditable = "true";
	nameCell.innerText = creature.name;
	nameCell.addEventListener("input", () => {
		let value = nameCell.innerText.trim();
		if (value != "") {
			creature.name = value;
			saveData();
		}
	});
	nameCell.addEventListener("focusout", () => {
		if (nameCell.innerText.trim() == "") {
			creature.name = Creature.DEFAULT_NAME;
			nameCell.innerText = Creature.DEFAULT_NAME;
			saveData();
		}

		reinsertRow(newRow, creature);
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

		let teamClassName = Creature.getTeamStyle(creature);
		for (const i in Team) {
			let team = TeamStyles[parseInt(i) as Team];
			newRow.classList.toggle(team, team == teamClassName);
		}

		reinsertRow(newRow, creature, false);
	});
	teamCell.appendChild(teamSelect);

	let initiativeRollCell = document.createElement("td") as HTMLTableCellElement;
	let initiativeRollField = document.createElement("input") as HTMLInputElement;
	initiativeRollField.type = "number";
	initiativeRollField.value = creature.initiativeRoll?.toString() ?? "";
	initiativeRollField.addEventListener("input", () => {
		let creatureIds = getSortedCreatureIds(true);
		let idCurrentTurn = creatureIds[options.turnIndex];
		creature.initiativeRoll = initiativeRollField.value == "" || isNaN(initiativeRollField.valueAsNumber) ? null : initiativeRollField.valueAsNumber;
		options.turnIndex = getSortedCreatureIds(true).indexOf(idCurrentTurn);
		saveData();
	});
	initiativeRollField.addEventListener("focusout", () => {
		reinsertRow(newRow, creature, false);
	});
	initiativeRollCell.appendChild(initiativeRollField);

	let dexterityCell = document.createElement("td") as HTMLTableCellElement;
	let dexterityField = document.createElement("input") as HTMLInputElement;
	dexterityField.type = "number";
	dexterityField.value = creature.dexterity.toString();
	dexterityField.addEventListener("input", () => {
		let value = dexterityField.valueAsNumber;
		if (isNaN(value)) return;
		let creatureIds = getSortedCreatureIds(true);
		let idCurrentTurn = creatureIds[options.turnIndex];
		creature.dexterity = value;
		options.turnIndex = getSortedCreatureIds(true).indexOf(idCurrentTurn);
		saveData();
	});
	dexterityField.addEventListener("focusout", () => {
		reinsertRow(newRow, creature, false);
	});
	dexterityCell.appendChild(dexterityField);

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
	let remainingHpContainer = document.createElement("span") as HTMLSpanElement;
	remainingHpContainer.innerText = Creature.getRemainingHp(creature)?.toString() ?? "-";
	let temporaryHpContainer = document.createElement("span") as HTMLSpanElement;
	temporaryHpContainer.className = SET_TEMPORARY_CLASS_NAME;
	if (creature.temporaryHp > 0) {
		temporaryHpContainer.innerText = "+" + creature.temporaryHp;
	}
	remainingHpCell.appendChild(remainingHpContainer);
	remainingHpCell.appendChild(temporaryHpContainer);

	let maxHpCell = document.createElement("td") as HTMLTableCellElement;
	let maxHpField = document.createElement("input") as HTMLInputElement;
	maxHpField.type = "number";
	maxHpField.value = creature.maxHp?.toString() ?? "-";
	maxHpField.addEventListener("input", () => {
		creature.maxHp = maxHpField.value == "" || isNaN(maxHpField.valueAsNumber) ? null : maxHpField.valueAsNumber;
		remainingHpContainer.innerText = Creature.getRemainingHp(creature)?.toString() ?? "-";
		saveData();
	});
	maxHpCell.appendChild(maxHpField);

	let woundsCell = document.createElement("td") as HTMLTableCellElement;
	woundsCell.innerText = creature.wounds.toString();


	let woundsToInflictCureCell = document.createElement("td") as HTMLTableCellElement;
	let woundsToInflictCureField = document.createElement("input") as HTMLInputElement;
	woundsToInflictCureField.type = "number";
	woundsToInflictCureField.className = WOUNDS_TO_INFLICT_CURE_CLASS_NAME;
	woundsToInflictCureCell.appendChild(woundsToInflictCureField);

	let inflictCell = document.createElement("td") as HTMLTableCellElement;
	let inflictButton = document.createElement("button") as HTMLButtonElement;
	inflictButton.innerText = INFLICT_BUTTON_TEXT;
	inflictButton.className = INFLICT_CLASS_NAME;
	inflictButton.addEventListener("click", () => {
		let value = woundsToInflictCureField.valueAsNumber;
		if (isNaN(value)) {
			return;
		}
		Creature.inflictWounds(creature, value);
		woundsCell.innerText = creature.wounds.toString();
		woundsToInflictCureField.value = "";
		let hp = Creature.getRemainingHp(creature);
		remainingHpContainer.innerText = hp?.toString() ?? EMPTY_VALUE_TEXT;
		temporaryHpContainer.innerText = creature.temporaryHp > 0 ? "+" + creature.temporaryHp : "";
		newRow.classList.toggle(DOWN_CLASS_NAME, hp != null && hp <= 0);
		saveData();
	});
	inflictCell.appendChild(inflictButton);

	let cureCell = document.createElement("td") as HTMLTableCellElement;
	let cureButton = document.createElement("button") as HTMLButtonElement;
	cureButton.innerText = CURE_BUTTON_TEXT;
	cureButton.className = CURE_CLASS_NAME;
	cureButton.addEventListener("click", () => {
		let value = woundsToInflictCureField.valueAsNumber;
		if (isNaN(value)) {
			return;
		}
		Creature.cureWounds(creature, value);
		woundsCell.innerText = creature.wounds.toString();
		woundsToInflictCureField.value = "";
		let hp = Creature.getRemainingHp(creature);
		remainingHpContainer.innerText = hp?.toString() ?? EMPTY_VALUE_TEXT;
		newRow.classList.toggle(DOWN_CLASS_NAME, hp != null && hp <= 0);
		saveData();
	});
	cureCell.appendChild(cureButton);

	let setTemporaryCell = document.createElement("td") as HTMLTableCellElement;
	let setTemporaryButton = document.createElement("button") as HTMLButtonElement;
	setTemporaryButton.innerText = SET_TEMPORARY_BUTTON_TEXT;
	setTemporaryButton.className = SET_TEMPORARY_CLASS_NAME;
	setTemporaryButton.addEventListener("click", () => {
		let value = woundsToInflictCureField.valueAsNumber;
		if (isNaN(value) || value < 0) {
			return;
		}
		creature.temporaryHp = value;
		temporaryHpContainer.innerText = creature.temporaryHp > 0 ? "+" + creature.temporaryHp : "";
		woundsToInflictCureField.value = "";
		saveData();
	});
	setTemporaryCell.appendChild(setTemporaryButton);

	let referenceCell = document.createElement("td") as HTMLTableCellElement;
	let referenceLink = document.createElement("a") as HTMLAnchorElement;
	let referenceField = document.createElement("input") as HTMLInputElement;
	let referenceUrlField = document.createElement("input") as HTMLInputElement;
	referenceLink.innerText = creature.reference != "" ? creature.reference : creature.referenceUrl;
	referenceLink.href = creature.referenceUrl;
	referenceLink.target = "_blank";
	referenceLink.classList.toggle(INACTIVE_LINK_CLASS_NAME, creature.referenceUrl == "");
	referenceField.type = "text";
	referenceField.placeholder = REFERENCE_FIELD_TEXT;
	referenceField.className = HIDDEN_CLASS_NAME;
	referenceField.value = creature.reference;
	referenceUrlField.type = "text";
	referenceUrlField.placeholder = REFERENCE_URL_FIELD_TEXT;
	referenceUrlField.className = HIDDEN_CLASS_NAME;
	referenceUrlField.value = creature.referenceUrl;
	referenceCell.appendChild(referenceLink);
	referenceCell.appendChild(referenceField);
	referenceCell.appendChild(referenceUrlField);

	let editReferenceCell = document.createElement("td") as HTMLTableCellElement;
	let editReferenceButton = document.createElement("button") as HTMLButtonElement;
	let editReferenceIcon = document.createElement("i") as HTMLElement;
	let editing = false;
	editReferenceIcon.className = EDIT_ICON;
	editReferenceButton.addEventListener("click", () => {
		editing = !editing;

		referenceField.classList.toggle(HIDDEN_CLASS_NAME, !editing);
		referenceUrlField.classList.toggle(HIDDEN_CLASS_NAME, !editing);
		referenceLink.classList.toggle(HIDDEN_CLASS_NAME, editing);

		if (!editing) {
			creature.referenceUrl = referenceUrlField.value;
			referenceLink.href = creature.referenceUrl;
			referenceLink.classList.toggle(INACTIVE_LINK_CLASS_NAME, creature.referenceUrl == "");

			creature.reference = referenceField.value;
			referenceLink.innerText = creature.reference != "" ? creature.reference : creature.referenceUrl;

			saveData();
		}
	});
	editReferenceButton.appendChild(editReferenceIcon);
	editReferenceCell.appendChild(editReferenceButton);

	let conditionsCell = document.createElement("td") as HTMLTableCellElement;
	conditionsCell.contentEditable = "true";
	conditionsCell.innerText = creature.conditions;
	conditionsCell.className = LIST_STYLE_CLASS_NAME;
	conditionsCell.addEventListener("input", () => {
		creature.conditions = conditionsCell.innerText;
		saveData();
	});

	let notesCell = document.createElement("td") as HTMLTableCellElement;
	notesCell.contentEditable = "true";
	notesCell.innerText = creature.notes;
	notesCell.addEventListener("input", () => {
		creature.notes = notesCell.innerText;
		saveData();
	});

	let manageCell = document.createElement("td") as HTMLTableCellElement;
	let duplicateButton = document.createElement("button") as HTMLButtonElement;
	let duplicateIcon = document.createElement("i") as HTMLElement;
	let deleteButton = document.createElement("button") as HTMLButtonElement;
	let deleteIcon = document.createElement("i") as HTMLElement;
	duplicateButton.className = DUPLICATE_BUTTON_CLASS_NAME;
	duplicateIcon.className = DUPLICATE_ICON;
	deleteButton.className = DELETE_BUTTON_CLASS_NAME;
	deleteIcon.className = DELETE_ICON;
	duplicateButton.addEventListener("click", () => {
		let clone = structuredClone(creature);
		updateIdAutoIncrement();
		clone.id = (Creature.autoIncrement++).toString();
		creatures[clone.id] = clone;
		addRow(clone);
		saveData();
	});
	deleteButton.addEventListener("click", () => {
		if (confirm(`${creature.name} will be permanently removed`)) {
			let creatureIds = getSortedCreatureIds(true);
			let idCurrentTurn = creatureIds[options.turnIndex];

			delete creatures[creature.id];
			newRow.remove();

			if (idCurrentTurn != creature.id) {
				options.turnIndex = creatureIds.indexOf(idCurrentTurn);
			}

			saveData();
			highlightCurrentTurn();
		}
	});

	duplicateButton.appendChild(duplicateIcon);
	deleteButton.appendChild(deleteIcon);
	manageCell.appendChild(duplicateButton);
	manageCell.appendChild(deleteButton);

	newRow.appendChild(nameCell);
	newRow.appendChild(teamCell);
	newRow.appendChild(initiativeRollCell);
	newRow.appendChild(dexterityCell);
	newRow.appendChild(armorClassCell);
	newRow.appendChild(remainingHpCell);
	newRow.appendChild(maxHpCell);
	newRow.appendChild(woundsCell);
	newRow.appendChild(woundsToInflictCureCell);
	newRow.appendChild(inflictCell);
	newRow.appendChild(cureCell);
	newRow.appendChild(setTemporaryCell);
	newRow.appendChild(referenceCell);
	newRow.appendChild(editReferenceCell);
	newRow.appendChild(conditionsCell);
	newRow.appendChild(notesCell);
	newRow.appendChild(manageCell);
}

function updateIdAutoIncrement() {
	Creature.autoIncrement = 1;

	while (Object.keys(creatures).includes(Creature.autoIncrement.toString())) {
		Creature.autoIncrement++;
	}
}

function addCreature() {
	updateIdAutoIncrement();
	let creatureIds = getSortedCreatureIds(true);
	let idCurrentTurn = creatureIds[options.turnIndex];

	let id = (Creature.autoIncrement++).toString();
	creatures[id] = new Creature(id);

	options.turnIndex = creatureIds.indexOf(idCurrentTurn);
	saveData();

	addRow(creatures[id]);
}

function endTurn() {
	options.turnIndex++;
	options.turnIndex %= Object.keys(creatures).length;
	saveData();
	highlightCurrentTurn();
}

function switchSortingMode() {
	options.sortByInitiative = !options.sortByInitiative;
	saveData();
	updateSortButton();

	for (const id of getSortedCreatureIds()) {
		let row = document.getElementById(ROW_ID_PREFIX + id) as HTMLTableRowElement;
		reinsertRow(row, creatures[id], false);
	}
}

function updateSortButton() {
	let sortIcon = document.createElement("i") as HTMLElement;
	sortIcon.className = options.sortByInitiative ? SORT_BY_INITIATIVE_ICON : SORT_BY_TEAM_ICON;
	SortButton.innerHTML = "";
	SortButton.title = options.sortByInitiative ? SORT_BY_TEAM_TEXT : SORT_BY_INITIATIVE_TEXT;
	SortButton.appendChild(sortIcon);
}

function importData() {
	if (ImportDataFileInput.files!.length < 1) {
		ImportErrorContainer.innerText = "No file selected";
		return;
	}

	ImportDataFileInput.files![0].text().then(
		(text) => {
			try {
				JSON.parse(text);
			} catch (error) {
				ImportErrorContainer.innerText = "The file's content is not valid JSON";
				return;
			}

			let backup = serializedData();

			if (!confirm("Are you sure you want to import the file ? Currently saved data will be overwritten. ")) {
				ImportErrorContainer.innerText = "";
				return;
			}

			localStorage.setItem(SAVE_KEY, text);

			try {
				CharacterListElement.innerHTML = "";
				loadData();
			} catch (error) {
				ImportErrorContainer.innerText = "Unable to parse data from the file's content";
				localStorage.setItem(SAVE_KEY, backup);
				loadData();
				return;
			}

			ImportErrorContainer.innerText = "";
		}
	);
}

function exportData() {
	let data = serializedData();

	let element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
	element.setAttribute("download", EXPORT_FILENAME);

	element.style.display = "none";
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}