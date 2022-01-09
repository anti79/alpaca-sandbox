from flask import url_for, redirect, render_template, flash, g, session,request
from flask_login import login_user, logout_user, current_user, login_required
from app import app, lm
from app.models import User
import subprocess

@app.route('/', methods=['post', 'get'])
def index():
	
	return render_template('index.html')
@app.route('/compile', methods=['post','get'])
def compile():
	if request.method == 'POST':
		code = request.form.get('code')  # запрос к данным формы
		with open("code.alp", 'w+') as file:
			file.write(code)
		js_code = subprocess.check_output(["python", "alpaca/alpaca", "code.alp", "-c", "javascript"]).decode("utf-8")
		with open("app/static/life1.js", 'w+') as file:
			file.write(js_code)

	return render_template('index.html')


# === User login methods ===

@app.before_request
def before_request():
	g.user = current_user

@lm.user_loader
def load_user(id):
	return User.query.get(int(id))

