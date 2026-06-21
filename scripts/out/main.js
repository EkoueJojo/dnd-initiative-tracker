"use strict";
const SAVE_KEY = "InitiativeTracker";
const SORT_BY_INITIATIVE_ICON = "fa-solid fa-arrow-down-9-1";
const SORT_BY_TEAM_ICON = "fa-solid fa-arrow-down-a-z";
const EDIT_ICON = "fa-solid fa-pen-to-square";
const DELETE_ICON = "fa-solid fa-trash";
const ROW_ID_PREFIX = "CharacterRow_";
const CURRENT_TURN_CLASS_NAME = "currentTurn";
const DOWN_CLASS_NAME = "down";
const WOUNDS_TO_INFLICT_CURE_CLASS_NAME = "woundsToInflictCure";
const INFLICT_CLASS_NAME = "inflict";
const CURE_CLASS_NAME = "cure";
const INACTIVE_LINK_CLASS_NAME = "inactiveLink";
const HIDDEN_CLASS_NAME = "hidden";
const LIST_STYLE_CLASS_NAME = "listStyle";
const DELETE_BUTTON_CLASS_NAME = "deleteButton";
const INFLICT_BUTTON_TEXT = "Inflict";
const CURE_BUTTON_TEXT = "Cure";
const EMPTY_VALUE_TEXT = "-";
const REFERENCE_FIELD_TEXT = "Display Name";
const REFERENCE_URL_FIELD_TEXT = "URL";
const SORT_BY_INITIATIVE_TEXT = "Sort by initiative roll and dexterity";
const SORT_BY_TEAM_TEXT = "Sort by team and name";
const CharacterListElement = document.getElementById("CharacterList");
const SortButton = document.getElementById("SortButton");
let creatures = {};
let options = { turnIndex: 0, sortByInitiative: false };
loadData();
function getSortedCreatureIds(byInitiative = false) {
    let compareTo = options.sortByInitiative || byInitiative ? Creature.compareInitiativeTo : Creature.compareTo;
    return Object.keys(creatures).sort((keyA, keyB) => compareTo(creatures[keyA], creatures[keyB]));
}
function highlightCurrentTurn() {
    var _a, _b;
    for (const element of document.getElementsByClassName(CURRENT_TURN_CLASS_NAME)) {
        element.classList.remove(CURRENT_TURN_CLASS_NAME);
    }
    let sortedCreatures = getSortedCreatureIds(true);
    let upCreatures = sortedCreatures.filter(id => { var _a; return creatures[id].initiativeRoll != null && ((_a = Creature.getRemainingHp(creatures[id])) !== null && _a !== void 0 ? _a : 1) > 0; });
    if (upCreatures.length == 0) {
        options.turnIndex = 0;
    }
    else {
        while (!upCreatures.includes(sortedCreatures[options.turnIndex])) {
            options.turnIndex++;
            options.turnIndex %= sortedCreatures.length;
        }
    }
    (_b = (_a = document.getElementById(ROW_ID_PREFIX + sortedCreatures[options.turnIndex])) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.classList.add(CURRENT_TURN_CLASS_NAME);
}
function loadData() {
    let savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        creatures = parsedData.creatures;
        options = parsedData.options;
    }
    updateSortButton();
    for (let id of getSortedCreatureIds()) {
        addRow(creatures[id], true);
    }
    highlightCurrentTurn();
}
function saveData() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ creatures: creatures, options: options }));
}
function findCreatureSortedIndex(creature) {
    return getSortedCreatureIds().indexOf(creature.id);
}
function reinsertRow(row, creature, resetTurn = true) {
    CharacterListElement.removeChild(row);
    CharacterListElement.insertBefore(row, CharacterListElement.children[findCreatureSortedIndex(creature)]);
    if (resetTurn) {
        options.turnIndex = 0;
        saveData();
        highlightCurrentTurn();
    }
}
function addRow(creature, append = false) {
    var _a, _b, _c, _d, _e, _f, _g;
    let newRow = CharacterListElement.insertRow(append ? -1 : findCreatureSortedIndex(creature));
    newRow.id = ROW_ID_PREFIX + creature.id;
    newRow.className = Creature.getTeamStyle(creature);
    newRow.classList.toggle(DOWN_CLASS_NAME, ((_a = Creature.getRemainingHp(creature)) !== null && _a !== void 0 ? _a : 1) <= 0);
    let nameCell = document.createElement("td");
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
    let teamCell = document.createElement("td");
    let teamSelect = document.createElement("select");
    for (let team in Team) {
        if (!isNaN(Number(team))) {
            let option = document.createElement("option");
            option.value = team;
            option.text = Team[team];
            teamSelect.appendChild(option);
        }
    }
    teamSelect.value = creature.team.toString();
    teamSelect.addEventListener("change", () => {
        creature.team = parseInt(teamSelect.value);
        saveData();
        let teamClassName = Creature.getTeamStyle(creature);
        for (const i in Team) {
            let team = TeamStyles[parseInt(i)];
            newRow.classList.toggle(team, team == teamClassName);
        }
        reinsertRow(newRow, creature);
    });
    teamCell.appendChild(teamSelect);
    let initiativeRollCell = document.createElement("td");
    let initiativeRollField = document.createElement("input");
    initiativeRollField.type = "number";
    initiativeRollField.value = (_c = (_b = creature.initiativeRoll) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "";
    initiativeRollField.addEventListener("input", () => {
        creature.initiativeRoll = initiativeRollField.value == "" || isNaN(initiativeRollField.valueAsNumber) ? null : initiativeRollField.valueAsNumber;
        saveData();
    });
    initiativeRollField.addEventListener("focusout", () => {
        reinsertRow(newRow, creature);
        options.turnIndex = 0;
        saveData();
        highlightCurrentTurn();
    });
    initiativeRollCell.appendChild(initiativeRollField);
    let dexterityCell = document.createElement("td");
    let dexterityField = document.createElement("input");
    dexterityField.type = "number";
    dexterityField.value = creature.dexterity.toString();
    dexterityField.addEventListener("input", () => {
        let value = dexterityField.valueAsNumber;
        if (isNaN(value))
            return;
        creature.dexterity = value;
        saveData();
    });
    dexterityField.addEventListener("focusout", () => {
        reinsertRow(newRow, creature);
        options.turnIndex = 0;
        saveData();
        highlightCurrentTurn();
    });
    dexterityCell.appendChild(dexterityField);
    let armorClassCell = document.createElement("td");
    let armorClassField = document.createElement("input");
    armorClassField.type = "number";
    armorClassField.value = creature.armorClass.toString();
    armorClassField.addEventListener("input", () => {
        let value = armorClassField.valueAsNumber;
        if (isNaN(value))
            return;
        creature.armorClass = value;
        saveData();
    });
    armorClassCell.appendChild(armorClassField);
    let remainingHpCell = document.createElement("td");
    remainingHpCell.innerText = (_e = (_d = Creature.getRemainingHp(creature)) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : "-";
    let maxHpCell = document.createElement("td");
    let maxHpField = document.createElement("input");
    maxHpField.type = "number";
    maxHpField.value = (_g = (_f = creature.maxHp) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : "-";
    maxHpField.addEventListener("input", () => {
        creature.maxHp = maxHpField.value == "" || isNaN(maxHpField.valueAsNumber) ? null : maxHpField.valueAsNumber;
        saveData();
    });
    maxHpCell.appendChild(maxHpField);
    let woundsCell = document.createElement("td");
    woundsCell.innerText = creature.wounds.toString();
    let woundsToInflictCureCell = document.createElement("td");
    let woundsToInflictCureField = document.createElement("input");
    woundsToInflictCureField.type = "number";
    woundsToInflictCureField.className = WOUNDS_TO_INFLICT_CURE_CLASS_NAME;
    woundsToInflictCureCell.appendChild(woundsToInflictCureField);
    let inflictCell = document.createElement("td");
    let inflictButton = document.createElement("button");
    inflictButton.innerText = INFLICT_BUTTON_TEXT;
    inflictButton.className = INFLICT_CLASS_NAME;
    inflictButton.addEventListener("click", () => {
        var _a;
        let value = woundsToInflictCureField.valueAsNumber;
        if (isNaN(value)) {
            return;
        }
        Creature.inflictWounds(creature, value);
        woundsCell.innerText = creature.wounds.toString();
        woundsToInflictCureField.value = "";
        let hp = Creature.getRemainingHp(creature);
        remainingHpCell.innerText = (_a = hp === null || hp === void 0 ? void 0 : hp.toString()) !== null && _a !== void 0 ? _a : EMPTY_VALUE_TEXT;
        newRow.classList.toggle(DOWN_CLASS_NAME, hp != null && hp <= 0);
        saveData();
    });
    inflictCell.appendChild(inflictButton);
    let cureCell = document.createElement("td");
    let cureButton = document.createElement("button");
    cureButton.innerText = CURE_BUTTON_TEXT;
    cureButton.className = CURE_CLASS_NAME;
    cureButton.addEventListener("click", () => {
        var _a, _b, _c;
        let value = woundsToInflictCureField.valueAsNumber;
        if (isNaN(value)) {
            return;
        }
        Creature.cureWounds(creature, value);
        woundsCell.innerText = creature.wounds.toString();
        woundsToInflictCureField.value = "";
        remainingHpCell.innerText = (_b = (_a = Creature.getRemainingHp(creature)) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : EMPTY_VALUE_TEXT;
        let hp = Creature.getRemainingHp(creature);
        remainingHpCell.innerText = (_c = hp === null || hp === void 0 ? void 0 : hp.toString()) !== null && _c !== void 0 ? _c : EMPTY_VALUE_TEXT;
        newRow.classList.toggle(DOWN_CLASS_NAME, hp != null && hp <= 0);
        saveData();
    });
    cureCell.appendChild(cureButton);
    let referenceCell = document.createElement("td");
    let referenceLink = document.createElement("a");
    let referenceField = document.createElement("input");
    let referenceUrlField = document.createElement("input");
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
    let editReferenceCell = document.createElement("td");
    let editReferenceButton = document.createElement("button");
    let editReferenceIcon = document.createElement("i");
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
    let conditionsCell = document.createElement("td");
    conditionsCell.contentEditable = "true";
    conditionsCell.innerText = creature.conditions;
    conditionsCell.className = LIST_STYLE_CLASS_NAME;
    conditionsCell.addEventListener("input", () => {
        creature.conditions = conditionsCell.innerText;
        saveData();
    });
    let notesCell = document.createElement("td");
    notesCell.contentEditable = "true";
    notesCell.innerText = creature.notes;
    notesCell.addEventListener("input", () => {
        creature.notes = notesCell.innerText;
        saveData();
    });
    let manageCell = document.createElement("td");
    let deleteButton = document.createElement("button");
    let deleteIcon = document.createElement("i");
    deleteButton.className = DELETE_BUTTON_CLASS_NAME;
    deleteIcon.className = DELETE_ICON;
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
    deleteButton.appendChild(deleteIcon);
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
    newRow.appendChild(referenceCell);
    newRow.appendChild(editReferenceCell);
    newRow.appendChild(conditionsCell);
    newRow.appendChild(notesCell);
    newRow.appendChild(manageCell);
}
function addCreature() {
    while (Object.keys(creatures).includes(Creature.autoIncrement.toString())) {
        Creature.autoIncrement++;
    }
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
        let row = document.getElementById(ROW_ID_PREFIX + id);
        reinsertRow(row, creatures[id], false);
    }
}
function updateSortButton() {
    let sortIcon = document.createElement("i");
    sortIcon.className = options.sortByInitiative ? SORT_BY_INITIATIVE_ICON : SORT_BY_TEAM_ICON;
    SortButton.innerHTML = "";
    SortButton.title = options.sortByInitiative ? SORT_BY_TEAM_TEXT : SORT_BY_INITIATIVE_TEXT;
    SortButton.appendChild(sortIcon);
}
