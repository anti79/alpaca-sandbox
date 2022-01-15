from flask import url_for, redirect, render_template, flash, g, session,request
from flask_login import login_user, logout_user, current_user, login_required
from app import app, lm
from app.models import User
import subprocess

example_alp = """
/*
John Conway's Game of Life, expressed in ALPACA.
*/
state Dead  "-" to Alive when 3 Alive and 5 Dead;
state Alive "@" to Dead when 4 Alive or 7 Dead.
"""
example_js = """
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


"""
@app.route('/', methods=['post', 'get'])
def index():
	
	return render_template('index.html', alp_code=example_alp ,js_code=example_js, states="var states = [\"Dead\", \"Alive\"]")
@app.route('/compile', methods=['post','get'])
def compile():
	if request.method == 'POST':
		code = request.form.get('code')
		with open("code.alp", 'w+') as file:
			file.write(code)
		js_code = subprocess.check_output(["python", "alpaca/alpaca", "code.alp", "-c", "javascript"]).decode("utf-8")
		with open("app/static/life1.js", 'w+') as file:
			file.write(js_code)

		return render_template('index.html', alp_code=code, js_code=js_code)
	return redirect(url_for('index'))

# === User login methods ===

@app.before_request
def before_request():
	g.user = current_user

@lm.user_loader
def load_user(id):
	return User.query.get(int(id))

