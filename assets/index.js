// Variables Declaration

const forms = document.querySelectorAll('form');
const places_q1 = document.querySelectorAll('.petri-net-1 .place');
const places_q2 = document.querySelectorAll('.petri-net-2 .place');
const places_q3 = document.querySelectorAll('.petri-net-3 .place');

const [free_q1, docu_q1, busy_q1] = [...places_q1];
const [wait_q2, inside_q2, done_q2] = [...places_q2];
const [free_q3, docu_q3, wait_q3, busy_q3, done_q3, inside_q3] = [...places_q3];

const getModel_q1 = (free = 1, docu = 0, busy = 0) => {
	const model = {
		id: 'q1',
		places: ['free', 'docu', 'busy'],
		transitions: [
			{
				name: 'start',
				preconditions: { 'free': free },
				postconditions: { 'busy': busy }
			},
			{
				name: 'change',
				preconditions: { 'busy': busy },
				postconditions: { 'docu': docu }
			},
			{
				name: 'end',
				preconditions: { 'docu': docu },
				postconditions: { 'free': free }
			}
		],
		marking: { 'free': free, 'docu': docu, 'busy': busy }
	};
	return model;
};

const getModel_q2 = (wait = 1, inside = 0, done = 0) => {
	const model = {
		id: 'q2',
		places: ['wait', 'inside', 'done'],
		transitions: [
			{
				name: 'start',
				preconditions: { 'wait': wait },
				postconditions: { 'inside': inside }
			},
			{
				name: 'change',
				preconditions: { 'inside': inside },
				postconditions: { 'done': done }
			}
		],
		marking: { 'wait': wait, 'inside': inside, 'done': done }
	};
	return model;
};

const getModel_q3 = (free = 1, docu = 0, wait = 1, busy = 0, done = 1, inside = 0) => {
	const model = {
		id: 'q3',
		places: ['wait', 'inside', 'free', 'docu', 'busy', 'done'],
		transitions: [
			{
				name: 'start',
				preconditions: { 'wait': wait, 'free': free },
				postconditions: { 'busy': busy, 'inside': inside }
			},
			{
				name: 'change',
				preconditions: { 'busy': busy, 'inside': inside },
				postconditions: { 'docu': docu, 'done': done }
			},
			{
				name: 'end',
				preconditions: { 'docu': docu },
				postconditions: { 'free': free }
			}
		],
		marking: { 'free': free, 'docu': docu, 'wait': wait, 'busy': busy, 'done': done, 'inside': inside }
	};
	return model;
};

class PetriNet {
	constructor(model) {
		this.model = model;
	}

	updateMarking() {
		let targetPetriNet;
		if (this.model.id === 'q1') {
			targetPetriNet = places_q1;
		}
		else if (this.model.id === 'q2') {
			targetPetriNet = places_q2;
		}
		else {
			targetPetriNet = places_q3;
		}

		let m0 = [];
		for (const [key, value] of Object.entries(this.model.marking)) {
			m0.push(value);
		}

		for (let i = 0; i < targetPetriNet.length; i++) {
			targetPetriNet[i].innerHTML = m0[i];
		}
	}

	firing(name) {
		const { transitions, marking } = this.model;
		const firingTrans = transitions.find(key => key.name === name);
		const { preconditions, postconditions } = firingTrans;

		let isValid = true;

		for (const key in preconditions) {
			if (preconditions[key] < 1) {
				isValid = false;
				break;
			}
		}

		if (isValid) {
			for (const key in preconditions) {
				marking[key]--;
			}
			for (const key in postconditions) {
				marking[key]++;
			}

			let m0 = [];
			for (const [key, value] of Object.entries(marking)) {
				m0.push(value);
			}

			if (this.model.id === 'q1') {
				const newNet = new PetriNet(getModel_q1(...m0));
				this.model = newNet.model;
			}
			else if (this.model.id === 'q2') {
				const newNet = new PetriNet(getModel_q2(...m0));
				this.model = newNet.model;
			}
			else {
				const newNet = new PetriNet(getModel_q3(...m0));
				this.model = newNet.model;
			}
		}
	}
}
// QUESTION 1

let petriNet_q1 = new PetriNet(getModel_q1());
let petriNet_q2 = new PetriNet(getModel_q2(5));
let petriNet_q3 = new PetriNet(getModel_q3(1, 0, 4));

forms.forEach(form => form.addEventListener('submit', (e) => {
	e.preventDefault();
	const tokens = +e.target[0].value;
	e.target[0].value = '';

	if (form.id === 'question-1') {
		free_q1.innerHTML = tokens;
		const { docu, busy } = petriNet_q1.model.marking;

		const model_q1 = getModel_q1(tokens, docu, busy);
		petriNet_q1 = new PetriNet(model_q1);
	}
	else if (form.id === 'question-2') {
		wait_q2.innerHTML = tokens;
		const { inside, done } = petriNet_q2.model.marking;

		const model_q2 = getModel_q2(tokens, inside, done);
		petriNet_q2 = new PetriNet(model_q2);
	}
	else {
		wait_q3.innerHTML = tokens;
		const { free, busy, docu, inside, done } = petriNet_q3.model.marking;

		const model_q3 = getModel_q3(free, docu, tokens, busy, done, inside);
		petriNet_q3 = new PetriNet(model_q3);
	}
}));

const transitions = document.querySelectorAll('.transition');

transitions.forEach(transition => transition.addEventListener('click', (e) => {
	const netClassList = e.path[3].classList;
	const target = e.path[1].classList[1];

	switch (true) {
		case netClassList.contains('petri-net-1'):
			petriNet_q1.firing(target);

			petriNet_q1.updateMarking();
			break;
		case netClassList.contains('petri-net-2'):
			petriNet_q2.firing(target);

			petriNet_q2.updateMarking();
			break;
		case netClassList.contains('petri-net-3'):
			petriNet_q3.firing(target);

			petriNet_q3.updateMarking();
			break;
	}
}));
