"use strict";
var Columns;
(function (Columns) {
    Columns[Columns["Name"] = 0] = "Name";
    Columns[Columns["Team"] = 1] = "Team";
    Columns[Columns["InitiativeRoll"] = 2] = "InitiativeRoll";
    Columns[Columns["InitiativeModifier"] = 3] = "InitiativeModifier";
    Columns[Columns["ArmorClass"] = 4] = "ArmorClass";
    Columns[Columns["RemainingHp"] = 5] = "RemainingHp";
    Columns[Columns["MaxHp"] = 6] = "MaxHp";
    Columns[Columns["DamageTaken"] = 7] = "DamageTaken";
    Columns[Columns["DamageToInflictCure"] = 8] = "DamageToInflictCure";
    Columns[Columns["InflictButton"] = 9] = "InflictButton";
    Columns[Columns["CureButton"] = 10] = "CureButton";
    Columns[Columns["Reference"] = 11] = "Reference";
    Columns[Columns["ReferenceIsLink"] = 12] = "ReferenceIsLink";
    Columns[Columns["Conditions"] = 13] = "Conditions";
    Columns[Columns["Notes"] = 14] = "Notes";
    Columns[Columns["DeleteButton"] = 15] = "DeleteButton";
})(Columns || (Columns = {}));
const CREATURES_SAVE_KEY = "InitiativeTrackerCreatures";
const OPTIONS_SAVE_KEY = "InitiativeTrackerOptions";
const CharacterListElement = document.getElementById("CharacterList");
let creatures = {};
let options = { turnIndex: 0, sortByInitiative: false };
loadData();
function loadData() {
    let savedCreatures = localStorage.getItem(CREATURES_SAVE_KEY);
    if (savedCreatures) {
        creatures = JSON.parse(savedCreatures);
    }
    let savedOptions = localStorage.getItem(OPTIONS_SAVE_KEY);
    if (savedOptions) {
        options = JSON.parse(savedOptions);
    }
    for (let id in creatures) {
        addRow(creatures[id]);
    }
}
function saveData() {
    localStorage.setItem(CREATURES_SAVE_KEY, JSON.stringify(creatures));
    localStorage.setItem(OPTIONS_SAVE_KEY, JSON.stringify(options));
}
function addRow(creature) {
    var _a, _b, _c, _d, _e, _f, _g;
    let newRow = document.createElement("tr");
    newRow.className = Creature.getTeamStyles(creature);
    newRow.classList.toggle("down", ((_a = Creature.getRemainingHp(creature)) !== null && _a !== void 0 ? _a : 1) <= 0);
    let nameCell = document.createElement("td");
    nameCell.contentEditable = "true";
    nameCell.innerText = creature.name;
    nameCell.addEventListener("input", () => {
        creature.name = nameCell.innerText;
        saveData();
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
    initiativeRollCell.appendChild(initiativeRollField);
    let initiativeModifierCell = document.createElement("td");
    let initiativeModifierField = document.createElement("input");
    initiativeModifierField.type = "number";
    initiativeModifierField.value = creature.initiativeModifier.toString();
    initiativeModifierField.addEventListener("input", () => {
        let value = initiativeModifierField.valueAsNumber;
        if (isNaN(value))
            return;
        creature.initiativeModifier = value;
        saveData();
    });
    initiativeModifierCell.appendChild(initiativeModifierField);
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
    let damageTakenCell = document.createElement("td");
    damageTakenCell.innerText = creature.damageTaken.toString();
    let damageToInflictCureCell = document.createElement("td");
    let damageToInflictCureField = document.createElement("input");
    damageToInflictCureField.type = "number";
    damageToInflictCureField.className = "damageToInflictCure";
    damageToInflictCureCell.appendChild(damageToInflictCureField);
    let inflictCell = document.createElement("td");
    let inflictButton = document.createElement("button");
    inflictButton.innerText = "Inflict";
    inflictButton.className = "inflict";
    inflictButton.addEventListener("click", () => {
        var _a;
        let value = damageToInflictCureField.valueAsNumber;
        if (isNaN(value)) {
            return;
        }
        Creature.inflictWounds(creature, value);
        damageTakenCell.innerText = creature.damageTaken.toString();
        damageToInflictCureField.value = "";
        let hp = Creature.getRemainingHp(creature);
        remainingHpCell.innerText = (_a = hp === null || hp === void 0 ? void 0 : hp.toString()) !== null && _a !== void 0 ? _a : "-";
        newRow.classList.toggle("down", hp != null && hp <= 0);
        saveData();
    });
    inflictCell.appendChild(inflictButton);
    let cureCell = document.createElement("td");
    let cureButton = document.createElement("button");
    cureButton.innerText = "Cure";
    cureButton.className = "cure";
    cureButton.addEventListener("click", () => {
        var _a, _b, _c;
        let value = damageToInflictCureField.valueAsNumber;
        if (isNaN(value)) {
            return;
        }
        Creature.cureWounds(creature, value);
        damageTakenCell.innerText = creature.damageTaken.toString();
        damageToInflictCureField.value = "";
        remainingHpCell.innerText = (_b = (_a = Creature.getRemainingHp(creature)) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "-";
        let hp = Creature.getRemainingHp(creature);
        remainingHpCell.innerText = (_c = hp === null || hp === void 0 ? void 0 : hp.toString()) !== null && _c !== void 0 ? _c : "-";
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
