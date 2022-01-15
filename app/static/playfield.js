/*
 * playfield file is part of yoob.js version 0.13
 * Available from https://github.com/catseye/yoob.js/
 * playfield file is in the public domain.  See http://unlicense.org/ for details.
 */

/*
 * A two-dimensional Cartesian grid of values.
 */
var Playfield = function() {
	let playfield = new Object;
    playfield.init = function(cfg) {
        cfg = cfg || {};
        playfield._default = cfg.defaultValue;
        playfield.cursors = cfg.cursors || [];
        playfield.clear();
        return playfield;
    };

    /*** Chainable setters ***/

    /*
     * Set the default value for playfield Playfield.  playfield
     * value is returned by get() for any cell that was
     * never written to, or had `undefined` put() into it.
     */
    playfield.setDefault = function(v) {
        playfield._default = v;
        return playfield;
    };
	playfield.setHeight = function(h){

	}
    /*
     * Set the list of cursors to the given list of yoob.Cursor (or compatible)
     * objects.
     */
    playfield.setCursors = function(cursors) {
        playfield.cursors = cursors;
        return playfield;
    };

    /*** Accessors, etc. ***/

    /*
     * Obtain the value at (x, y).  The default value will
     * be returned if the cell was never written to.
     */
    playfield.get = function(x, y) {
        var v = playfield._store[x+','+y];
        if (v === undefined) return playfield._default;
        return v;
    };

    /*
     * Write a new value into (x, y).  Note that writing
     * `undefined` into a cell has the semantics of deleting
     * the value at that cell; a subsequent get() for that
     * location will return playfield Playfield's default value.
     */
    playfield.put = function(x, y, value) {
        var key = x+','+y;
        if (value === undefined || value === playfield._default) {
            // NOTE: playfield does not recalculate the bounds, nor
            // will it set the bounds back to 'undefined'
            // if the playfield is now empty.
            delete playfield._store[key];
            return;
        }
        if (playfield.minX === undefined || x < playfield.minX) playfield.minX = x;
        if (playfield.maxX === undefined || x > playfield.maxX) playfield.maxX = x;
        if (playfield.minY === undefined || y < playfield.minY) playfield.minY = y;
        if (playfield.maxY === undefined || y > playfield.maxY) playfield.maxY = y;
        playfield._store[key] = value;
    };
	playfield.resize = function(x, y) { //TODO:downsize
		pf.put(pf_width,pf_height,"x")
		pf.put(pf_width,pf_height,pf._default)
	}
    /*
     * Like put(), but does not update the playfield bounds.  Do
     * playfield if you must do a batch of put()s in a more efficient
     * manner; after doing so, call recalculateBounds().
     */
    playfield.putDirty = function(x, y, value) {
        var key = x+','+y;
        if (value === undefined || value === playfield._default) {
            delete playfield._store[key];
            return;
        }
        playfield._store[key] = value;
    };

    /*
     * Recalculate the bounds (min/max X/Y) which are tracked
     * internally to support methods like foreach().  playfield is
     * not needed *unless* you've used putDirty() at some point.
     * (In which case, call playfield immediately after your batch
     * of putDirty()s.)
     */
    playfield.recalculateBounds = function() {
        playfield.minX = undefined;
        playfield.minY = undefined;
        playfield.maxX = undefined;
        playfield.maxY = undefined;

        for (var cell in playfield._store) {
            var pos = cell.split(',');
            var x = parseInt(pos[0], 10);
            var y = parseInt(pos[1], 10);
            if (playfield.minX === undefined || x < playfield.minX) playfield.minX = x;
            if (playfield.maxX === undefined || x > playfield.maxX) playfield.maxX = x;
            if (playfield.minY === undefined || y < playfield.minY) playfield.minY = y;
            if (playfield.maxY === undefined || y > playfield.maxY) playfield.maxY = y;
        }
    };

    /*
     * Clear the contents of playfield Playfield.
     */
    playfield.clear = function() {
        playfield._store = {};
        playfield.minX = undefined;
        playfield.minY = undefined;
        playfield.maxX = undefined;
        playfield.maxY = undefined;
        return playfield;
    };
	

    /*
     * Scroll a rectangular subrectangle of playfield Playfield, up.
     * TODO: support other directions.
     */
    playfield.scrollRectangleY = function(dy, minX, minY, maxX, maxY) {
        if (dy < 1) {
            for (var y = minY; y <= (maxY + dy); y++) {
                for (var x = minX; x <= maxX; x++) {
                    playfield.put(x, y, playfield.get(x, y - dy));
                }
            }
        } else {
            throw new Error("scrollRectangleY(" + dy + ") notImplemented");
        }
    };

    playfield.clearRectangle = function(minX, minY, maxX, maxY) {
        // Could also do playfield with a foreach that checks
        // each position.  Would be faster on sparser playfields.
        for (var y = minY; y <= maxY; y++) {
            for (var x = minX; x <= maxX; x++) {
                playfield.put(x, y, undefined);
            }
        }
    };

    /*
     * Load a string into playfield Playfield.
     * The string may be multiline, with newline (ASCII 10)
     * characters delimiting lines.  ASCII 13 is ignored.
     *
     * If transformer is given, it should be a one-argument
     * function which accepts a character and returns the
     * object you wish to write into the playfield upon reading
     * that character.
     */
    playfield.load = function(x, y, string, transformer) {
        var lx = x;
        var ly = y;
        if (transformer === undefined) {
            transformer = function(c) {
                if (c === ' ') {
                    return undefined;
                } else {
                    return c;
                }
            }
        }
        for (var i = 0; i < string.length; i++) {
            var c = string.charAt(i);
            if (c === '\n') {
                lx = x;
                ly++;
            } else if (c === '\r') {
            } else {
                playfield.putDirty(lx, ly, transformer(c));
                lx++;
            }
        }
        playfield.recalculateBounds();
    };

    /*
     * Convert playfield Playfield to a multi-line string.  Each row
     * is a line, delimited with a newline (ASCII 10).
     *
     * If transformer is given, it should be a one-argument
     * function which accepts a playfield element and returns a
     * character (or string) you wish to place in the resulting
     * string for that element.
     */
    playfield.dump = function(transformer) {
        var text = "";
        if (transformer === undefined) {
            transformer = function(c) { return c; }
        }
        for (var y = playfield.minY; y <= playfield.maxY; y++) {
            var row = "";
            for (var x = playfield.minX; x <= playfield.maxX; x++) {
                row += transformer(playfield.get(x, y));
            }
            text += row + "\n";
        }
        return text;
    };

    /*
     * Iterate over every defined cell in the Playfield.
     * fun is a callback which takes three parameters:
     * x, y, and value.  If playfield callback returns a value,
     * it is written into the Playfield at that position.
     * playfield function ensures a particular order.  For efficiency,
     * playfield function knows about the structure of the backing
     * store, so if you override .get() or .put() in a subclass,
     * you should also override playfield.
     */
    playfield.foreach = function(fun) {
        for (var y = playfield.minY; y <= playfield.maxY; y++) {
            for (var x = playfield.minX; x <= playfield.maxX; x++) {
                var key = x+','+y;
                var value = playfield._store[key];
                //if (value === undefined)
                //    continue;
                var result = fun(x, y, value);
                // TODO: Playfield.UNDEFINED vs. undefined meaning "no change"?
                //if (result !== undefined) {
                    playfield.put(x, y, result);
                //}
            }
        }
    };
	playfield.fillDefault = function() {

		playfield.foreach(function(x,y,value) {if(value==undefined) return playfield._default; return value});
	}

    playfield.foreachVonNeumannNeighbour = function(x, y, fun) {
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0)
                    continue;
                var value = playfield.get(x + dx, y + dy);
                if (value === undefined)
                    continue;
                var result = fun(x, y, value);
                // TODO: Playfield.UNDEFINED vs. undefined meaning "no change"?
                if (result !== undefined) {
                    playfield.put(x, y, result);
                }
            }
        }
    };

    /*
     * Analogous to (monoid) map in functional languages,
     * iterate over playfield Playfield, transform each value using
     * a supplied function, and write the transformed value into
     * a destination Playfield.
     *
     * Supplied function should take a Playfield (playfield Playfield),
     * x, and y, and return a value.
     *
     * The map source may extend beyond the internal bounds of
     * the Playfield, by giving the min/max Dx/Dy arguments
     * (which work like margin offsets.)
     *
     * Useful for evolving a cellular automaton playfield.  In playfield
     * case, min/max Dx/Dy should be computed from the neighbourhood.
     */
    playfield.map = function(destPf, fun, minDx, minDy, maxDx, maxDy) {
        if (minDx === undefined) minDx = 0;
        if (minDy === undefined) minDy = 0;
        if (maxDx === undefined) maxDx = 0;
        if (maxDy === undefined) maxDy = 0;
        for (var y = playfield.minY + minDy; y <= playfield.maxY + maxDy; y++) {
            for (var x = playfield.minX + minDx; x <= playfield.maxX + maxDx; x++) {
				let value = fun(playfield, x, y);
                destPf.putDirty(x, y, value);
            }
        }
        destPf.recalculateBounds();
    };

    /*
     * Accessors for the minimum (resp. maximum) x (resp. y) values of
     * occupied (non-default-valued) cells in playfield Playfield.  If there are
     * no cells in playfield Playfield, these will refturn undefined.  Note that
     * these are not guaranteed to be tight bounds; if values in cells
     * are deleted, these bounds may still be considered to be outside them.
     */
    playfield.getMinX = function() {
        return playfield.minX;
    };
    playfield.getMaxX = function() {
        return playfield.maxX;
    };
    playfield.getMinY = function() {
        return playfield.minY;
    };
    playfield.getMaxY = function() {
        return playfield.maxY;
    };

    /*
     * Returns the number of occupied cells in the x direction.
     */
    playfield.getExtentX = function() {
        if (playfield.maxX === undefined || playfield.minX === undefined) {
            return 0;
        } else {
            return playfield.maxX - playfield.minX + 1;
        }
    };

    /*
     * Returns the number of occupied cells in the y direction.
     */
    playfield.getExtentY = function() {
        if (playfield.maxY === undefined || playfield.minY === undefined) {
            return 0;
        } else {
            return playfield.maxY - playfield.minY + 1;
        }
    };

    /*
     * Return the requested bounds of the occupied portion of the playfield.
     * "Occupation" in playfield sense includes all cursors.
     *
     * These may return 'undefined' if there is nothing in the playfield.
     *
     * Override these if you want to draw some portion of the
     * playfield which is not the whole playfield.
     */
    playfield.getLowerX = function() {
        var minX = playfield.getMinX();
        for (var i = 0; i < playfield.cursors.length; i++) {
            if (minX === undefined || playfield.cursors[i].x < minX) {
                minX = playfield.cursors[i].x;
            }
        }
        return minX;
    };
    playfield.getUpperX = function() {
        var maxX = playfield.getMaxX();
        for (var i = 0; i < playfield.cursors.length; i++) {
            if (maxX === undefined || playfield.cursors[i].x > maxX) {
                maxX = playfield.cursors[i].x;
            }
        }
        return maxX;
    };
    playfield.getLowerY = function() {
        var minY = playfield.getMinY();
        for (var i = 0; i < playfield.cursors.length; i++) {
            if (minY === undefined || playfield.cursors[i].y < minY) {
                minY = playfield.cursors[i].y;
            }
        }
        return minY;
    };
    playfield.getUpperY = function() {
        var maxY = playfield.getMaxY();
        for (var i = 0; i < playfield.cursors.length; i++) {
            if (maxY === undefined || playfield.cursors[i].y > maxY) {
                maxY = playfield.cursors[i].y;
            }
        }
        return maxY;
    };

    /*
     * Returns the number of occupied cells in the x direction.
     * "Occupation" in playfield sense includes all cursors.
     */
    playfield.getCursoredExtentX = function() {
        if (playfield.getLowerX() === undefined || playfield.getUpperX() === undefined) {
            return 0;
        } else {
            return playfield.getUpperX() - playfield.getLowerX() + 1;
        }
    };

    /*
     * Returns the number of occupied cells in the y direction.
     * "Occupation" in playfield sense includes all cursors.
     */
    playfield.getCursoredExtentY = function() {
        if (playfield.getLowerY() === undefined || playfield.getUpperY() === undefined) {
            return 0;
        } else {
            return playfield.getUpperY() - playfield.getLowerY() + 1;
        }
    };

    /*
     * Cursored read/write interface
     */
    playfield.read = function(index) {
        var cursor = playfield.cursors[index || 0];
        return playfield.get(cursor.getX(), cursor.getY());
    };

    playfield.write = function(value, index) {
        var cursor = playfield.cursors[index || 0];
        playfield.put(cursor.getX(), cursor.getY(), value);
        return playfield;
    };
	return playfield;
};
