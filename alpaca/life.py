
def in_nbhd_pred(pf, x, y, pred, nbhd) :
  count = 0
  for i in range(0, len(nbhd)) :
	if (pred(pf.get(x+nbhd[i][0], y+nbhd[i][1]))) :
	  count++
	
  
  return count


def in_nbhd_eq(pf, x, y, stateId, nbhd) :
  return in_nbhd_pred(pf, x, y, return x == stateId , nbhd)


def evolve_playfield(pf, new_pf) :
  pf.map(new_pf, evalState, -1, -1, 1, 1)

def loadMapper(c) :
  if (c === ' ') return 'Dead'
  if (c === '*') return 'Alive'

def dumpMapper(s) :
  if (s === 'Dead') return ' '
  if (s === 'Alive') return '*'

def eval_Dead(pf, x, y) :
id
if (((in_nbhd_eq(pf, x, y, 'Alive', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 3)&&(in_nbhd_eq(pf, x, y, 'Dead', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 5))) :
  return 'Alive'

return 'Dead'


def eval_Alive(pf, x, y) :
id
if (((in_nbhd_eq(pf, x, y, 'Alive', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 4)||(in_nbhd_eq(pf, x, y, 'Dead', [[0,-1],[0,1],[-1,0],[-1,1],[-1,-1],[1,0],[1,1],[1,-1]]) >= 7))) :
  return 'Dead'

return 'Alive'


def evalState(pf, x, y) :
  stateId = pf.get(x, y)
  if (stateId === 'Dead') return eval_Dead(pf, x, y)
  if (stateId === 'Alive') return eval_Alive(pf, x, y)

defaultCell = 'Dead'
