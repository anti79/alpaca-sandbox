"""
Backend for compiling ALPACA AST to Javascript.  Perhaps not complete.

"""

from analysis import (
	get_class_map, find_nbhd_defn, BoundingBox, fit_bounding_box,
	get_defined_playfield, construct_representation_map
)


class Compiler(object):
	def __init__(self, alpaca, file, options=None):
		"""alpaca is an ALPACA description in AST form.  file is a file-like
		object to which the compiled code will be written.

		"""
		self.alpaca = alpaca
		self.file = file
		self.options = options

	def compile(self):
		bb = BoundingBox(0, 0, 0, 0)
		fit_bounding_box(self.alpaca, bb)
		self.file.write("""\

def in_nbhd_pred(pf, x, y, pred, nbhd) :
  count = 0
  for i in range(0, len(nbhd)) :
	if (pred(pf.get(x+nbhd[i][0], y+nbhd[i][1]))) :
	  count++
	
  
  return count


def in_nbhd_eq(pf, x, y, stateId, nbhd) :
  return in_nbhd_pred(pf, x, y, return x == stateId , nbhd)


def evolve_playfield(pf, new_pf) :
  pf.map(new_pf, evalState, %d, %d, %d, %d)

""" % (-1 * bb.max_dx, -1 * bb.max_dy, -1 * bb.min_dx, -1 * bb.min_dy,))

		# write the CA's load and dump mappers
		repr_map = construct_representation_map(self.alpaca)
		self.file.write("def loadMapper(c) :\n")
		for (char, state_id) in repr_map.items():
			self.file.write("  if (c === '%s') return '%s'\n" %
							(char, state_id))
		self.file.write("\n")

		self.file.write("def dumpMapper(s) :\n")
		for (char, state_id) in repr_map.items():
			self.file.write("  if (s === '%s') return '%s'\n" %
							(state_id, char))
		self.file.write("\n")

		class_map = get_class_map(self.alpaca)
		for (class_id, state_set) in class_map.items():
			self.file.write("def is_%s(st) :\n" % class_id)
			self.file.write("  return ")
			for state_id in state_set:
				self.file.write("(st === '%s') || " % state_id)
			self.file.write("0\n\n\n")
		for defn in self.alpaca.defns:
			if defn.type == 'ClassDefn':
				self.compile_class_defn(defn)
		for defn in self.alpaca.defns:
			if defn.type == 'StateDefn':
				self.compile_state_defn(defn)
		self.write_evalstate_def()
		pf = get_defined_playfield(self.alpaca)
		if pf is not None:
			self.file.write("defaultCell = '%s'\n" % pf.default)
			try:
				self.file.write("initialPlayfield = [:]\n".format(','.join("[%d, %d, '%s']" % (x, y, c) for (x, y, c) in list(pf.iteritems()))))
			except:
				pass
			
		return True

	def write_evalstate_def(self):
		self.file.write("""\
def evalState(pf, x, y) :
  stateId = pf.get(x, y)
""")
		for defn in self.alpaca.defns:
			if defn.type == 'StateDefn':
				self.file.write("""\
  if (stateId === '%s') return eval_%s(pf, x, y)
""" % (defn.id, defn.id))
		self.file.write('\n')

	def compile_class_defn(self, defn):
		self.file.write("def evalClass_%s(pf, x, y, seen) :\nid\nseen['%s'] = true\n" % (defn.id, defn.id))
		for rule in defn.rules:
			dest = rule.state_ref
			expr = rule.expr
			self.file.write("if (")
			self.compile_expr(expr)
			self.file.write(") :\n  return ")
			self.compile_state_ref(dest)
			self.file.write("\n\n")
		for superclass in defn.classes:
			self.file.write("id = seen['%s'] ? None : evalClass_%s(pf, x, y, seen)\n" % (superclass.id, superclass.id))
			self.file.write("if (id !== None) return id\n")
		self.file.write("return None\n\n\n")

	def compile_state_defn(self, defn):
		#char_repr = defn.children[0]
		self.file.write("def eval_%s(pf, x, y) :\nid\n" % defn.id)
		for rule in defn.rules:
			dest = rule.state_ref
			expr = rule.expr
			self.file.write("if (")
			self.compile_expr(expr)
			self.file.write(") :\n  return ")
			self.compile_state_ref(dest)
			self.file.write("\n\n")
		for superclass in defn.classes:
			self.file.write("id = evalClass_%s(pf, x, y, :)\n" % superclass.id)
			self.file.write("if (id !== None) return id\n")
		self.file.write("return '%s'\n\n\n" % defn.id)

	def compile_state_ref(self, ref):
		# compare to eval_state_ref
		if ref.type == 'StateRefEq':
			self.file.write("'%s'" % ref.id)
		elif ref.type == 'StateRefRel':
			self.file.write("pf.get(x+%d,y+%d)" % (ref.value[0], ref.value[1]))
		else:
			raise NotImplementedError(repr(ref))

	def compile_relation(self, ref, ast):
		if ast.type == 'ClassDecl':
			self.file.write('is_%s(' % ast.id)
			self.compile_state_ref(ref)
			self.file.write(")")
		else:
			self.file.write('(')
			self.compile_state_ref(ref)
			self.file.write('===')
			self.compile_state_ref(ast)
			self.file.write(')')

	def compile_expr(self, expr):
		if expr.type == 'BoolOp':
			self.file.write('(')
			self.compile_expr(expr.lhs)
			self.file.write({
				'or': '||',
				'and': '&&',
				'xor': '!==',
			}[expr.op])
			self.compile_expr(expr.rhs)
			self.file.write(')')
		elif expr.type == 'Not':
			self.file.write('!(')
			self.compile_expr(expr.expr)
			self.file.write(')')
		elif expr.type == 'BoolLit':
			if expr.value == 'guess':
				self.file.write('(Math.random()<.5)')
			else:
				self.file.write(expr.value)
		elif expr.type == 'Relational':
			self.compile_relation(expr.lhs, expr.rhs)
		elif expr.type == 'Adjacency':
			count = expr.count
			rel = expr.rel
			nbhd = expr.nbhd
			if nbhd.type == 'NbhdRef':
				nbhd = find_nbhd_defn(self.alpaca, nbhd.id).children[0]
			assert nbhd.type == 'Neighbourhood'
			if rel.type == 'ClassDecl':
				self.file.write("(in_nbhd_pred(pf, x, y, is_%s" % rel.id)
			else:
				self.file.write('(in_nbhd_eq(pf, x, y, ')
				self.compile_state_ref(rel)
			self.file.write(', [')
			self.file.write(','.join(
				['[%d,%d]' % child.value for child in nbhd.children]
			))
			self.file.write(']) >= %d)' % int(count))
		else:
			raise NotImplementedError(repr(expr))
