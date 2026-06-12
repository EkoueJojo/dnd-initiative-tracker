"use strict";
var Team;
(function (Team) {
    Team[Team["Pc"] = 0] = "Pc";
    Team[Team["Ally"] = 1] = "Ally";
    Team[Team["Neutral"] = 2] = "Neutral";
    Team[Team["Enemy"] = 3] = "Enemy";
})(Team || (Team = {}));
const TeamStyles = {
    [Team.Pc]: "teamPc",
    [Team.Ally]: "teamAlly",
    [Team.Neutral]: "teamNeutral",
    [Team.Enemy]: "teamEnemy"
};
class Creature {
    constructor(id, name = "", team = Team.Neutral, initiativeModifier = 0, armorClass = 10, maxHp = 8) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.initiativeRoll = null;
        this.initiativeModifier = initiativeModifier;
        this.armorClass = armorClass;
        this.maxHp = maxHp;
        this.damageTaken = 0;
        this.hpLowerRange = null;
        this.hpUpperRange = null;
        this.conditions = [];
        this.reference = "";
        this.referenceIsUrl = false;
        this.notes = "";
    }
    static getTeamStyles(creature) { return TeamStyles[creature.team]; }
    static getRemainingHp(creature) {
        if (creature.maxHp === null || creature.damageTaken === null) {
            return null;
        }
        return creature.maxHp - creature.damageTaken;
    }
    static cureWounds(creature, amount) {
        if (creature.maxHp == null || creature.damageTaken == null) {
            return;
        }
        creature.damageTaken -= amount;
        if (creature.damageTaken < 0) {
            creature.damageTaken = 0;
        }
    }
    static inflictWounds(creature, amount) {
        if (creature.maxHp == null || creature.damageTaken == null) {
            return;
        }
        creature.damageTaken += amount;
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
