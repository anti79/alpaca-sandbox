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
var states = ["Dead","Alive"];
function loadMapper(c) {
  if (c === '-') return 'Dead';
  if (c === '@') return 'Alive';
};
function dumpMapper(s) {
  if (s === 'Dead') return '-';
  if (s === 'Alive') return '@';
};
function eval_Dead(pf, x, y) {
var id;
if (((in_nbhd_eq(pf, x, y, 'Alive', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 3)&&(in_nbhd_eq(pf, x, y, 'Dead', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 5))) {
  return 'Alive';
}
return 'Dead';
}

function eval_Alive(pf, x, y) {
var id;
if (((in_nbhd_eq(pf, x, y, 'Alive', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 4)||(in_nbhd_eq(pf, x, y, 'Dead', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 7))) {
  return 'Dead';
}
return 'Alive';
}

function evalState(pf, x, y) {
  var stateId = pf.get(x, y);
  if (stateId === 'Dead') return eval_Dead(pf, x, y);
  if (stateId === 'Alive') return eval_Alive(pf, x, y);
}
