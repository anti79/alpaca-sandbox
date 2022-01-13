pf = Playfield();
pf.init();

new_pf = Playfield();
new_pf.init();

pixelSize = 10
pf_width = 100
pf_height = 30

selected_state = pf._default;

function makePalette() {
	let palette = document.getElementById("palette")
	states.forEach(state => {
		let button = document.createElement("button");
		button.innerText = state;
		button.addEventListener('click', function() {
			selected_state = state;
		});
		palette.appendChild(button);
	})
}
function onload() {
	load();
	makeSpans();
	draw();
	makePalette();
}
function reset() {
	pf.clear()
	new_pf.clear()
	load()
	draw()
}
function load() {
	pf.load(0,0,"-------\n--@----\n---@---\n-@@@---\n-------\n-------", loadMapper)
	pf.setDefault("Dead");
	
	pf.put(pf_width,pf_height,"Alive")
	pf.put(pf_width,pf_height,pf._default)
	document.getElementById("pf-div").textContent = pf.dump(dumpMapper); 
}
function getCursorPosition() {
	const rect = document.getElementById("pf-div").getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	const pos = {x, y};
	return pos;
}
function draw() {
	//document.getElementById("pf-div").textContent = pf.dump(dumpMapper); 
	for(let x=0;x<=pf_height;x++) {
		for(let y=0;y<=pf_width;y++) {
			let span = document.getElementById(y + "," + x)
			span.innerText = dumpMapper(pf.get(y,x))
		}
	}

}
function step() {
	evolve_playfield(pf, new_pf);
	pf = new_pf;
	draw()
	new_pf = Playfield();
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
        let characters = el['innerText'].split('');
        el.innerHTML = '';
        characters.forEach(char => {
            let span = document.createElement('span');
            span.innerText = char;
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
                putcell(this, selected_state);
				
                console.log(coords);
            });
            el.appendChild(span);
        });
    });
};
