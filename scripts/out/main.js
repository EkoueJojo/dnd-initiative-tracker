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
    Columns[Columns["Conditions"] = 12] = "Conditions";
    Columns[Columns["Notes"] = 13] = "Notes";
    Columns[Columns["DeleteButton"] = 14] = "DeleteButton";
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
    let newRow = document.createElement("tr");
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
    newRow.appendChild(nameCell);
    newRow.appendChild(teamCell);
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
