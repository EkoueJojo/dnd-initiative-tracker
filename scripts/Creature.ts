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

	id: string;
	name: string;
	team: Team;
	initiativeRoll: number | null;
	initiativeModifier: number;
	armorClass: number;

	maxHp: number | null;
	damageTaken: number;
	hpLowerRange: number | null;
	hpUpperRange: number | null;
	conditions: string[];
	reference: string;
	referenceIsUrl: boolean;
	notes: string;

	constructor(id: string, name: string = "", team: Team = Team.Neutral, initiativeModifier: number = 0, armorClass: number = 10, maxHp: number | null = 8) {
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

	static getTeamStyles(creature: Creature): string { return TeamStyles[creature.team]; }
	static getRemainingHp(creature: Creature): number | null {
		if (creature.maxHp === null) {
			return null;
		}

		return creature.maxHp - creature.damageTaken;
	}

	static inflictWounds(creature: Creature, amount: number) {
		if (creature.maxHp == null || amount < 0) {
			return;
		}

		creature.damageTaken += amount;
	}

	static cureWounds(creature: Creature, amount: number) {
		if (creature.maxHp == null || amount < 0) {
			return;
		}

		creature.damageTaken -= amount;

		if (creature.damageTaken < 0) {
			creature.damageTaken = 0;
		}
	}

	static compareTo(a: Creature, b: Creature): number {
		let teamComparison = a.team - b.team;
		return teamComparison != 0 ? teamComparison : a.name.localeCompare(b.name);
	}

	static compareInitiativeTo(a: Creature, b: Creature): number {
		if (a.initiativeRoll == null) return b.initiativeRoll != null ? 1 : 0;
		else if (b.initiativeRoll == null) return -1;

		let initiativeComparison = Math.sign(b.initiativeRoll - a.initiativeRoll);

		if (initiativeComparison != 0) return initiativeComparison;
		else return Math.sign(b.initiativeModifier - a.initiativeModifier);
	}
}