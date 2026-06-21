enum Team {
	PC = 0,
	Ally = 1,
	Neutral = 2,
	Enemy = 3
}

const TeamStyles: { [key in Team]: string } = {
	[Team.PC]: "teamPc",
	[Team.Ally]: "teamAlly",
	[Team.Neutral]: "teamNeutral",
	[Team.Enemy]: "teamEnemy"
};

class Creature {
	static autoIncrement = 1;
	static readonly DEFAULT_NAME = "New Creature";

	id: string;
	name: string;
	team: Team;
	initiativeRoll: number | null;
	dexterity: number;
	armorClass: number;

	maxHp: number | null;
	wounds: number;
	hpLowerRange: number | null;
	hpUpperRange: number | null;
	conditions: string;
	reference: string;
	referenceUrl: string;
	notes: string;

	constructor(id: string, name: string = "", team: Team = Team.Neutral, dexterity: number = 10, armorClass: number = 10, maxHp: number | null = 8) {
		this.id = id;
		this.name = name.trim();
		if (this.name == "") this.name = Creature.DEFAULT_NAME;
		this.team = team;
		this.initiativeRoll = null;
		this.dexterity = dexterity;
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

	static getTeamStyle(creature: Creature): string { return TeamStyles[creature.team]; }
	static getRemainingHp(creature: Creature): number | null {
		if (creature.maxHp === null) {
			return null;
		}

		return creature.maxHp - creature.wounds;
	}

	static inflictWounds(creature: Creature, amount: number) {
		if (creature.maxHp == null || amount < 0) {
			return;
		}

		creature.wounds += amount;
	}

	static cureWounds(creature: Creature, amount: number) {
		if (creature.maxHp == null || amount < 0) {
			return;
		}

		creature.wounds -= amount;

		if (creature.wounds < 0) {
			creature.wounds = 0;
		}
	}

	static compareTo(a: Creature, b: Creature): number {
		let teamComparison = Math.sign(a.team - b.team);
		return teamComparison != 0 ? teamComparison : a.name.localeCompare(b.name);
	}

	static compareInitiativeTo(a: Creature, b: Creature): number {
		if (a.initiativeRoll == null) return b.initiativeRoll != null ? 1 : 0;
		else if (b.initiativeRoll == null) return -1;

		let initiativeComparison = Math.sign(b.initiativeRoll - a.initiativeRoll);

		if (initiativeComparison != 0) return initiativeComparison;
		else return Math.sign(b.dexterity - a.dexterity);
	}
}