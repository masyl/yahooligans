
/*
The Gatekeeper object is both the constructor for instances of the simulator and
the pseudo-class object containing the static methods and constructors for individual
gates.
*/
var Gatekeeper = function(gates) {

	var gatekeeper = {};

	// Both the object literal and gatescript is supported for
	// instantiating new circuits
	if (typeof gates === "string") {
		gatekeeper.gates = Gatekeeper.parse(gates);
	} else if (typeof gates === "object") {
		gatekeeper.gates = gates;
	}

	// Both phase of the clock is implemented in two method called tick and tock
	// which need to be called as a chain, one after the other like so: circuit.tick().tock();
	// Triggering both methods complete a curcuit cycle and flushes the buffered state

	// The circuit wide tick which ticks each gate in sequence
	gatekeeper.tick = function() {
		var a, b,
			gate;
		for (var iGate in this.gates) {
			gate = this.gates[iGate];
//			console.log("gate", gate);
//			console.log("this.gates", this.gates);
			a = this.gates[gate.aRef].state;
			b = this.gates[gate.bRef].state;
//			console.log("ab", a, b, this, gate.aRef, gate.bRef);
			gate.tick(a, b);
		};
		return this;
	};

	// The circuit wide tock which tocks each gate in sequence
	gatekeeper.tock = function() {
		for (var iGate in this.gates) {
			this.gates[iGate].tock();
		}
		return this;
	};

	return gatekeeper;
};

/*
The base Gate constructor from which other gates are instantiated
The actual logic behavior of the gate is injected upon instanciation.
*/
Gatekeeper.Gate = function(type, aRef, bRef, state, logic) {
	var gate = {
		type: type,
		aRef: aRef,
		bRef: bRef,
		state: state,
		logic: logic,
		nextState: null,
		tick: function(a, b) {
//			console.log("this", this);
			this.nextState = this.logic(a, b);
		},
		tock: function() {
			this.state = this.nextState;
			this.nextState = null;
		}
	};
	return gate;
};

// Parses the gatescript syntax and return a collection of gates
// with their states initiated
Gatekeeper.parse = function(gatescript) {
	var gates = {},
		iToken,
		gateName,
		gateDef,
		gateType,
		gateRefA,
		gateRefB,
		gateState,
		gateToken,
		gateTokens,
		gateRefs,
		newGate;
	try {
		gateTokens = gatescript.split(";");
		for (iToken in gateTokens) {
			gateToken = gateTokens[iToken];
			gateName = gateToken.split("=")[0];
			gateDef = gateToken.split("=")[1];
			gateType = gateDef.split("(")[0];
			gateDef = gateDef.split("(")[1].split(")")[0];
			gateRefA = gateDef.split(",")[0];
			gateRefB = gateDef.split(",")[1];
			gateState = gateDef.split(",")[2];
			newGate = Gatekeeper[gateType](gateRefA, gateRefB, (gateState==="true") ? true : false);
			gates[gateName] = newGate;
		}
	} catch(e) {
		console.error(e);
	}
	return gates;
};

/*
The series of gate available to build virtual circuits
*/
Gatekeeper.true = function(a, b, state) {
	return this.Gate("true", a, b, state, function(){ return true });
};
Gatekeeper.false = function(a, b, state) {
	return this.Gate("false", a, b, state, function(){ return false });
};
Gatekeeper.nand = function(a, b, state) {
	return this.Gate("nand", a, b, state, function(a,b){ return !(a && b) });
};
Gatekeeper.nor = function(a, b, state) {
	return this.Gate("nor", a, b, state, function(a,b){ return !(a || b) });
};
Gatekeeper.and = function(a, b, state) {
	return this.Gate("and", a, b, state, function(a,b){ return a && b });
};
Gatekeeper.or = function(a, b, state) {
	return this.Gate("or", a, b, state, function(a,b){ return a || b });
};




