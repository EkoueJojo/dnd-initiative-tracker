"use strict";
var Team;
(function (Team) {
    Team[Team["PC"] = 0] = "PC";
    Team[Team["Ally"] = 1] = "Ally";
    Team[Team["Neutral"] = 2] = "Neutral";
    Team[Team["Enemy"] = 3] = "Enemy";
})(Team || (Team = {}));
const TeamStyles = {
    [Team.PC]: "teamPc",
    [Team.Ally]: "teamAlly",
    [Team.Neutral]: "teamNeutral",
    [Team.Enemy]: "teamEnemy"
};
class Creature {
    constructor(id, name = "", team = Team.Neutral, initiativeModifier = 0, armorClass = 10, maxHp = 8) {
        this.id = id;
        this.name = name.trim();
        if (this.name == "")
            this.name = Creature.DEFAULT_NAME;
        this.team = team;
        this.initiativeRoll = null;
        this.initiativeModifier = initiativeModifier;
        this.armorClass = armorClass;
        this.maxHp = maxHp;
        this.wounds = 0;
        this.hpLowerRange = null;
        this.hpUpperRange = null;
        this.conditions = "";
        this.reference = "";
        this.referenceUrl = "";
        this.notes = "";
    }
    static getTeamStyles(creature) { return TeamStyles[creature.team]; }
    static getRemainingHp(creature) {
        if (creature.maxHp === null) {
            return null;
        }
        return creature.maxHp - creature.wounds;
    }
    static inflictWounds(creature, amount) {
        if (creature.maxHp == null || amount < 0) {
            return;
        }
        creature.wounds += amount;
    }
    static cureWounds(creature, amount) {
        if (creature.maxHp == null || amount < 0) {
            return;
        }
        creature.wounds -= amount;
        if (creature.wounds < 0) {
            creature.wounds = 0;
        }
    }
    static compareTo(a, b) {
        let teamComparison = a.team - b.team;
        return teamComparison != 0 ? teamComparison : a.name.localeCompare(b.name);
    }
    static compareInitiativeTo(a, b) {
        if (a.initiativeRoll == null)
            return b.initiativeRoll != null ? 1 : 0;
        else if (b.initiativeRoll == null)
            return -1;
        let initiativeComparison = Math.sign(b.initiativeRoll - a.initiativeRoll);
        if (initiativeComparison != 0)
            return initiativeComparison;
        else
            return Math.sign(b.initiativeModifier - a.initiativeModifier);
    }
}
Creature.autoIncrement = 1;
Creature.DEFAULT_NAME = "New Creature";
