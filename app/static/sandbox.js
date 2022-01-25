pf = Playfield();
pf.init();

new_pf = Playfield();
new_pf.init();

pixelSize = 10
pf_width = 150
pf_height = 50

var spans; 
var timer;
var palette;
var new_pf;

class Palette {
	constructor() {
		this._selected_state = pf._default;
		this._div = document.getElementById("palette")
		return this;
	}
	createElement() {
		states.forEach(state => {
			let button = document.createElement("button");
			button.textContent = state;
			
			button.addEventListener('click', function() {
				palette._selected_state = state;
				palette.highlightSelected();
	
			}, this);
			palette._div.appendChild(button);
		}, this)
	}
	highlightSelected() {
		let palette = document.getElementById("palette");
		let buttons = palette.childNodes;
		buttons.forEach(element => {
			if(element.textContent ==this._selected_state) element.className="palette-button-selected";
			else element.className="palette-button";
		});
			
		
	}
	get selected_state() {
		return this._selected_state;
	}
	set selected_state(val) {
		this._selected_state = val;
	}
	
}

function onload() {
	spans = new Array(pf_height+1).fill(0).map(() => new Array(pf_width+1).fill(0));
	let pagename = location.href.split("/").slice(-1)[0];
	if(pagename=="") loadExample();
	else loadEmpty();
	makeSpans();
	draw();
	palette = new Palette();
	palette.createElement();
	palette.highlightSelected();

	document.getElementById("speed").addEventListener("change", function() {
		stopTimer();
		setTimer();
	})

	

}
function setTimer() {
	timer = window.setInterval(step, document.getElementById("speed").value);

}
function stopTimer() {
	clearInterval(timer);
}
function reset() {
	pf.clear()
	new_pf.clear()
	loadExample()
	draw()
}
function loadExample() {
	pf.load(0,0,"-------\n--@----\n---@---\n-@@@---\n-------\n-------", loadMapper)
	pf.setDefault("Dead");
	pf.resize(pf, pf_height)
	document.getElementById("pf-div").textContent = pf.dump(dumpMapper); 
}
function loadEmpty() {
	let loadstring = "";
	let fill = dumpMapper(states[0]);
	for(let line=0;line<pf_height;line++) {
		loadstring += fill.repeat(pf_width);
		loadstring += '\n';
	}
	pf.load(0,0,loadstring, loadMapper);
	pf.setDefault(states[0]);
	pf.resize(pf, pf_height)
	document.getElementById("pf-div").textContent = pf.dump(dumpMapper); 
	//pf.load()
}

function draw() {
	//document.getElementById("pf-div").textContent = pf.dump(dumpMapper); 
	for(let x=0;x<=pf_height;x++) {
		for(let y=0;y<=pf_width;y++) {
			let span = spans[x][y]
			if(span == 0) {
				spans[x][y] = document.getElementById(y + "," + x)
			}


			span.textContent = dumpMapper(pf.get(y,x))
		}
	}

}

new_pf = Playfield();
new_pf.init();

function step() {
	evolve_playfield(pf, new_pf);
	for(let x=0;x<=pf_height;x++) {
		for(let y=0;y<=pf_width;y++) {
			pf.putDirty(x,y, new_pf.get(x,y));
		}
	}
	draw()
	new_pf.init();
	
	
}

function putcell(span, state) {
	let x = span.id.split(",")[0];
	let y = span.id.split(",")[1];
	pf.put(x,y,state);
	draw();
	console.log({x,y});
}

function makeSpans() {
	currentLine = 0
	let position = 0;
	let x = 0;
	let y = 0;
    document.querySelectorAll('.charPosition').forEach(el => {
        let characters = el['textContent'].split('');
        el.textContent = '';
        characters.forEach(char => {
            let span = document.createElement('span');
            span.textContent = char;
			if(char=='\n') {
				currentLine++;
				el.appendChild(span);
				x = 0;
				return;
			}
			

            x++;
			y = currentLine;
			
			let coords = [ x-1,y  ];
			span.id = coords;
			span.className = "char-span"
            span.addEventListener('click', function () {
                putcell(this, palette.selected_state);
				
                console.log(coords);
            });
			//spans[x][y] = span;
            el.appendChild(span);
        });
    });
};
