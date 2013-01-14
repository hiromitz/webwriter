/*

Commands.js

*/
Extend(Editor.prototype, {

	addLines: function (lines) {
		lines = this.parserLines(lines);
		this.element.content.appendChild(lines);
	},

	replaceLines: function (from, to, lines) {
		var parent = this.element.content;
		lines = this.parserLines(lines);
		if (from === to) {
			parent.replaceChild(lines, this.getLine(from));
		} else {
			var line = this.getLine(from), end = to - from + 1, next;
			while (end--) {
				next = line.nextSibling;
				parent.removeChild(line);
				line = next;
			}
			if (line) {
				parent.insertBefore(lines, line);
			} else {
				parent.appendChild(lines);
			}
		}
	},

	updateView: function (from, to) {
		if (this.focusmode) {
			var line = this.getLine(this.from.line);
			if (line) {
				line.classList.remove("active");
			}
			this.getLine(from.line).classList.add("active");
		}
		this.updateSelection(from, to);
		this.updateCursor(from, to);
		this.updateInput();
	},

	getSize: function () {
		return this.element.content.childNodes.length;
	},

	getLine: function (line) {
		return this.element.content.childNodes[line-1];
	},

	getText: function (from, to) {
		var line, text, i;

		line = this.getLine(from);
		text = [line.textContent];
		if (from != to) {
			i = from;
			while (i < to) {
				line = line.nextSibling;
				text.push(line.textContent);
				++i;
			}
		}
		return text.join("\n");
	},

	getContent: function (from, to) {
		var line, text, i, offset = 0, value;

		line = this.getLine(from.line);
		text = [line.textContent];
		if (!Range.line(from, to)) {
			i = from.line;
			while (i < to.line) {
				offset += line.textContent.length;
				line = line.nextSibling;
				text.push(line.textContent);
				++i;
			}
		}

		value = {
			textContent: text.join("\n"),
			selectionStart: from.ch,
			selectionEnd: offset + to.ch + text.length - 1
		};

		value.chunk = [ value.textContent.slice(0, value.selectionStart),
						value.textContent.slice(value.selectionStart, value.selectionEnd),
						value.textContent.slice(value.selectionEnd) ];

		return value;

	},

	getPositionFromPoint: function (x, y) {
		var element = this.element, wrapper = element.wrapper, view = element.view;
		x += wrapper.getBoundingClientRect().left;
		y += view.getBoundingClientRect().top + 8;
		y -= view.scrollTop - parseInt(wrapper.style.paddingTop);
		return this.getPosition(x, y);
	},

	getPositionFromEvent: function (event) {
		return this.getPosition(event.x, event.y);
	},

	getPositionFromChar: function (line, ch) {

		var node, walker, size, content, range, position, x, y;

		node = this.getLine(line);

		walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
		size = ch;

		while (walker.nextNode()) {
			node = walker.currentNode;
			if (node.textContent.length >= size) {
				break;
			}
			size -= node.textContent.length;
		}

		range = document.createRange();
		range.selectNodeContents(node);
		range.setStart(range.startContainer, size);
		range.setEnd(range.endContainer, size);
		
		var positions = range.getClientRects(), position;
		position = positions.length > 1 ? positions[1] : positions[0];

		var element = this.element, wrapper = element.wrapper, content = element.content, line_height = this.line_height;

		x = position.left,
		y = Math.floor((position.top - content.getBoundingClientRect().top)/line_height);

		return {
			line: line,
			ch: ch,
			x: x - wrapper.getBoundingClientRect().left,
			y: y * line_height
		};

	},

	getPosition: function (x, y) {
		var range = document.caretRangeFromPoint(x, y);

		if (range.startContainer.className === "cursor") {
			// ocultamos el cursor y volvemos a crear el rango
			this.hideCursor();
			range = document.caretRangeFromPoint(x, y);
		}

		range.expand('character');

		var node = range.startContainer, ch = range.startOffset, tag = this.tag_container;
		while (node) {
			if (node.localName == tag) {
				break;
			}
			if (node.previousSibling) {
				ch += node.previousSibling.textContent.length;
				node = node.previousSibling;
			} else {
				node = node.parentNode;		
			}
		}

		var line = 0;
		while (node) {
			node = node.previousSibling;
			++line;
		}
		var positions = range.getClientRects(), position;
		if (positions.length > 1) {
			var position = positions[( y > positions[0].bottom ? 1 : 0 )];
		} else {
			var position = positions[0];
		}

		var element = this.element, wrapper = element.wrapper, content = element.content, line_height = this.line_height;

		x = position.left,
		y = Math.floor((position.top - content.getBoundingClientRect().top)/line_height);

		return {
			line: line,
			ch: ch,
			x: x - wrapper.getBoundingClientRect().left,
			y: y * line_height
		};
	},

	findWord: function (position) {
      var line = this.getLine(position.line).textContent;
      var start = position.ch, end = position.ch;
      while (start > 0 && Range.isWordChar(line.charAt(start - 1))) --start;
      while (end < line.length && Range.isWordChar(line.charAt(end))) ++end;

      var from = this.getPositionFromChar(position.line, start);
      var to = this.getPositionFromChar(position.line, end);

      return {
      	from: from,
      	to: to,
      };
	},

	findPoint: function (point, dir, unit) {
		var self = this, line = point.line, ch = point.ch, node, size = this.getSize() + 1;
		node = this.getLine(line);

		function findNextLine() {
			for (var l = line + dir, e = dir < 0 ? 0 : size; l != e; l += dir) {
				line = l;
				node = self.getLine(line);
				return true;
			}
		}

		function moveOnce(boundToLine) {
			if (ch == (dir < 0 ? 0 : node.textContent.length)) {
				if (!boundToLine && findNextLine()) ch = dir < 0 ? node.textContent.length : 0;
				else return false;
			} else ch += dir;
			return true;
		}

		if (unit == "char") moveOnce();
		else if (unit == "column") moveOnce(true);
		else if (unit == "word") {
			var sawWord = false;
			for (;;) {
				if (dir < 0) if (!moveOnce()) break;
				if (Range.isWordChar(node.textContent.charAt(ch))) sawWord = true;
				else if (sawWord) {if (dir < 0) {dir = 1; moveOnce();} break;}
				if (dir > 0) if (!moveOnce()) break;
			}
		}

		return this.getPositionFromChar(line, ch, dir);
	},

	moveHorizontalPoint: function (dir, unit) {
		var from = this.from, to = this.to, position = to;
		if (this.shiftSelecting || Range.equal(from, to)) {
			position = this.findPoint(position, dir, unit);
		} else if (!Range.less(from, to)) {
			position = dir < 0 ? to : from;
		} else {
			position = dir < 0 ? from : to;
		}
		this.updateView(this.shiftSelecting ? this.from : position, position);
		this.previousSelection = null;
	},

	moveVerticalPoint: function (dir, unit) {
		var distance = 0, from = this.from, to = this.to, position = to;
		if (unit == "page") {
			distance = scroller.clientHeight;
		} else if (unit == "line") {
			distance = this.line_height;
		}
		if (this.shiftSelecting || Range.equal(from, to)) {
			if (this.previousSelection != null) {
				to.x = this.previousSelection;
			}
			// posicionar el cursor, coger donde esta
			var copyCursor = Range.copy(to);
			copyCursor.y = to.y + distance * dir;
			this.updateCursor(copyCursor, copyCursor);
			position = this.getPositionFromPoint(to.x, copyCursor.y);
		} else if (!Range.less(from, to)) {
			position = dir < 0 ? to : from;
		} else {
			position = dir < 0 ? from : to;
		}
		this.updateView(this.shiftSelecting ? this.from : position, position);
		this.previousSelection = to.x;
	},

	removePoint: function (dir, unit) {
		var position,
			node,
			del,
			line,
			value = this.getInputValue(true),
			from = this.selectionStart(),
			to = this.selectionEnd();
		if (this.focusmode) {
			var scrollH = this.element.content.offsetHeight, scrollT = this.element.view.scrollTop;
		}
		// borramos segun la dirección
		if (!Range.equal(from, to)) {
			del = value[1];
			value = value[0]+value[2];
			position = from;
		} else if (dir < 0) {
			position = this.findPoint(from, dir, unit);
			from = position;
			line = this.getContent(from, to);
			node = line.textContent;
			del = node.slice(line.selectionStart, line.selectionEnd);
			value = node.slice(0, line.selectionStart) + value[2];
		} else {
			position = this.findPoint(from, dir, unit);
			to = position;
			line = this.getContent(from, to);
			node = line.textContent;
			del = node.slice(line.selectionStart, line.selectionEnd);
			value = value[0] + node.slice(line.selectionEnd);
		}
		// eliminamos lineas y actualizamos
		this.replaceLines(from.line, to.line, value);
		// calcular de nuevo por si cambia la posición del caracter
		position = this.getPositionFromChar(position.line, position.ch);
		this.addHistory({
			add: "",
			del: del,
			textSelected: this.textSelected ? to : null,
			from: from,
			to: position
		});
		if (this.focusmode) {
			var newScrollH = this.element.content.offsetHeight;
			if (scrollH != newScrollH) {
				this.element.view.scrollTop = scrollT + newScrollH - scrollH;
			}
		}
		this.updateView(position, position);
	}

});