/* 

Events.js

*/
Extend(Editor.prototype, {
	addEvents: function () {
		var el = this.element;
			view = el.view,
			input = el.input;
		/* View */
		Event.on(view, "mousedown", this.onMouseDown.bind(this));
		Event.on(view, "selectstart", Event.preventDefault);
		/* Textarea */
		Event.on(input, "keyup", this.onKeyUp.bind(this));
		Event.on(input, "input", this.onInput.bind(this));
		Event.on(input, "keydown", this.onKeyDown.bind(this));
		Event.on(input, "focus", this.onFocus.bind(this));
		Event.on(input, "blur", this.onBlur.bind(this));
		Event.on(input, "paste", this.onPaste.bind(this));
	},
	onFocus: function (e) {
		if (!this.focused) {
			this.focused = true;
			this.editor.classList.add("focused");
		}
		this.blinkCursor();
	},
	onBlur: function (e) {
		if (this.focused) {
			this.focused = false;
			this.editor.classList.remove("focused");
		}
		this.save();
		this.hideCursor();
		var self = this;
		setTimeout(function () { if (!self.focused) self.setShift(); }, 150);
	},
	onMouseDown: function (e) {

		if (e.target.localName == this.mark_container) {
			return Event.preventDefault(e);
		}

		var self = this, view = this.element.view.getBoundingClientRect(), line = this.from.line;
		var y = e.y >= view.bottom - 10 ? e.y - 10 : e.y;
		var start = this.getPosition(e.x, y), last, going;
		
		this.setShift(e.shiftKey);

		// widget / todo
		if (e.target.classList.contains("todo")) {
			this.toggleToDo(start, start);
			return Event.preventDefault(e);
		}

		if (!this.focused) this.onFocus();

		/* Drag and doble click */
		var now = +new Date;
		if (this.lastDoubleClick && this.lastDoubleClick.time > now - 400 && Range.equal(this.lastDoubleClick.position, start)) {
			Event.preventDefault(e);
			return this.selectLine(start);
		} else if (this.lastClick && this.lastClick.time > now - 400 && Range.equal(this.lastClick.position, start)) {
			this.lastDoubleClick = { 
				time: now,
				position: start
			};
			Event.preventDefault(e);
			return this.selectWordAt(start);
		} else {
			this.lastClick = { 
				time: now,
				position: start
			};
		}

		Event.preventDefault(e);

		this.updateCursor(start, start);

		last = start;
		start = this.shiftSelecting || start;
		this.previousSelection = null;
		this.updateSelection(start, last);

		var mousemove = function (e) {

			if (e.target.localName == self.mark_container) {
				return Event.preventDefault(e);
			}

			var end, element = self.element.view;
			if (e.y <= view.top + 10) {

				end = last;
				if (element.scrollTop !== 0) {
					element.scrollTop -= self.line_height;
					going = setTimeout(function (){ mousemove(e); } , 150);
					if (element.scrollTop === 0) {
						end = self.getPositionFromChar(1, 0);
					} else {
						end = self.getPosition(e.x, e.y + 10);
					}
				}
				

			} else if (e.y >= view.bottom - 10) {
				
				end = last;
				if (element.scrollHeight - element.offsetHeight !== element.scrollTop) {
					element.scrollTop += self.line_height;
					end = self.getPosition(e.x, e.y - 10);
					going = setTimeout(function (){ mousemove(e); } , 150);
				}
				

			} else {
				end = self.getPositionFromEvent(e);
			}
			last = end;

			self.updateSelection(start, end);

		};

		var move = Event.on(this.element.view, "mousemove", function (e) {

			clearTimeout(going);
			Event.preventDefault(e);
			mousemove(e);

		}, true);

		var up = Event.on(window, "mouseup", function (e) {

			clearTimeout(going);

			Event.preventDefault(e);
			if (self.focusmode) {
				self.getLine(line).classList.remove("active");
				self.editor.classList.add("focusmode");
				var mouseWheel = Event.on(self.element.view, "mousewheel", function (e) {
					self.onMouseWheel();
					mouseWheel();
				}, true);
			}
			self.updateView(self.from, self.to);
			self.focusInput();

			move();
			up();
		}, true);

	},
	onMouseWheel: function () {
		this.getLine(this.selectionStart().line).classList.remove("active");
		this.editor.classList.remove("focusmode");
	},
	onKeyDown: function (e) {
		if (!this.focused) {
			this.focusInput();
		}
		var code = keyBindings.keyNames[e.keyCode], bound, dropShift;
		this.setShift(e.keyCode == 16 || e.shiftKey);
		if (code == null || e.altGraphKey) {
			return null;
		}
		if (e.altKey) {
			code = "alt+" + code;
		}
		if (e.ctrlKey) {
			code = ( mac ? "ctrl" : "super" ) + "+" + code;
		}
		if (e.metaKey) {
			code = "super+" + code;
		}
		if (e.shiftKey && (bound = keyBindings.bind["shift+" + code])) {
			dropShift = true;
		} else {
			bound = keyBindings.bind[code];
		}
		if (typeof bound == "string") {
			bound = this[bound].bind(this);
		}
		if (!bound) {
			return false;
		}
		if (dropShift) {
			var prevShift = this.shiftSelecting;
			this.shiftSelecting = null;
			bound();
			this.shiftSelecting = prevShift;
		} else {
			bound();
		}
		Event.preventDefault(e);
	},
	onInput: function () {
		var self = this;
		setTimeout(function () {
			self.add();
		}, 5);
	},
	onKeyUp: function (e) {
		if (e.keyCode == 16) {
			this.shiftSelecting = null;
		} else {
			this.textPasted = null;
		}
	},
	onPaste: function (e) {
		this.textPasted = true;
	}
});