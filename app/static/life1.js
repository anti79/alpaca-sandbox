/*
 * This file was AUTOMATICALLY generated from an ALPACA description.
 * EDIT AT YOUR OWN RISK!
 */

function in_nbhd_pred(pf, x, y, pred, nbhd) {
  var count = 0;
  for (var i = 0; i < nbhd.length; i++) {
	if (pred(pf.get(x+nbhd[i][0], y+nbhd[i][1]))) {
	  count++;
	}
  }
  return count;
}

function in_nbhd_eq(pf, x, y, stateId, nbhd) {
  return in_nbhd_pred(pf, x, y, function(x) { return x === stateId; }, nbhd);
}

function evolve_playfield(pf, new_pf) {
  pf.map(new_pf, evalState, -1, -1, 1, 1);
}
var states = ["step1","step2","step3"];
function loadMapper(c) {
  if (c === '@') return 'step1';
  if (c === '$') return 'step2';
  if (c === '.') return 'step3';
};
function dumpMapper(s) {
  if (s === 'step1') return '@';
  if (s === 'step2') return '$';
  if (s === 'step3') return '.';
};
function eval_step1(pf, x, y) {
var id;
if ((in_nbhd_eq(pf, x, y, 'step1', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 3)) {
  return 'step2';
}
return 'step1';
}

function eval_step2(pf, x, y) {
var id;
if ((in_nbhd_eq(pf, x, y, 'step2', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 3)) {
  return 'step3';
}
return 'step2';
}

function eval_step3(pf, x, y) {
var id;
if ((in_nbhd_eq(pf, x, y, 'step3', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 3)) {
  return 'step1';
}
return 'step3';
}

function evalState(pf, x, y) {
  var stateId = pf.get(x, y);
  if (stateId === 'step1') return eval_step1(pf, x, y);
  if (stateId === 'step2') return eval_step2(pf, x, y);
  if (stateId === 'step3') return eval_step3(pf, x, y);
}
