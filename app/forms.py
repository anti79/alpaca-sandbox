from flask_wtf import FlaskForm
from wtforms  import TextField, TextAreaField, DateTimeField, PasswordField
from wtforms.validators import Required

class CodeForm(FlaskForm):
	code = TextField(u'Code', validators = [Required()])

	#recaptcha = RecaptchaField(u'Recaptcha')
