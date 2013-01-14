var keyBindings = {

	bind: {
		/* Basic */
		"left": "goCharLeft",
		"right": "goCharRight",
		"up": "goLineUp",
		"down": "goLineDown",
		"end": "goLineEnd",
		"home": "goDocStart",
		"pageUp": "goPageUp",
		"pageDown": "goPageDown",
		"delete": "delCharRight",
		"backspace": "delCharLeft",
		"tab": "indentMore",
		"shift+tab": "indentLess",
		"enter": "newlineAndIndent", 
		"insert": "toggleOverwrite",
		/* Commands */
		"super+d": "toggleFocusMode",
		"super+a": "selectAll",
		"super+z": "undo",
		"shift+super+z": "redo",
		"super+y": "redo",
		"super+up": "goDocStart",
		"super+end": "goDocEnd",
		"super+down": "goDocEnd",
		"alt+left": "goWordLeft",
		"alt+right": "goWordRight",
		"super+left": "goLineStart",
		"super+right": "goLineEnd",
		"alt+up": "goLineStart",
		"alt+down": "goLineEnd",
		"alt+backspace": "delWordLeft",
		"ctrl+alt+backspace": "delWordRight",
		"super+backspace": "deleteLine",
		"alt+delete": "delWordRight",
		"super+s": "save",
		"super+f": "find",
		"super+g": "findNext",
		"shift+super+g": "findPrev",
		"super+alt+f": "replace",
		"shift+super+alt+f": "replaceAll",
		"super+f": "toggleFullScreen",
		"super+b": "makeStrong",
		"super+i": "makeEmphasis",
		"super+u": "makeDelete",
		"super+l": "toggleToDo",
		// "super+tab": "toggleDocument",
		// "super+e": "toggleWidth",
		/* emacsy */
		"Ctrl-F": "goCharRight",
		"Ctrl-B": "goCharLeft",
		"Ctrl-P": "goLineUp",
		"Ctrl-N": "goLineDown",
		"Alt-F": "goWordRight",
		"Alt-B": "goWordLeft",
		"Ctrl-A": "goLineStart",
		"Ctrl-E": "goLineEnd",
		"Ctrl-V": "goPageUp",
		"Shift-Ctrl-V": "goPageDown",
		"Ctrl-D": "delCharRight",
		"Ctrl-H": "delCharLeft",
		"Alt-D": "delWordRight",
		"Alt-Backspace": "delWordLeft",
		"Ctrl-K": "killLine",
		"Ctrl-T": "transposeChars"
	},

	windows: {
		"super+left": "goWordLeft", 
		"super+right": "goWordRight", 
		"alt+left": "goLineStart", 
		"alt+right": "goLineEnd",
		"super+home": "goDocStart",
		"alt+up": "goDocStart",
		"super+delete": "delWordRight",
		"shift+super+f": "replace",
		"shift+super+r": "replaceAll"
	},

	smartTypingPairs: {
		'"' : '"',
		"(" : ")",
		"{" : "}",
		"[" : "]",
		"<" : ">",
		"`" : "`"
	}

};

if (win) {
	for (var command in keyBindings.windows) {
		keyBindings.bind[command] = keyBindings.windows[command];
	}
}

var keyNames = {
	3: "enter", 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt",
	19: "pause", 20: "capsLock", 27: "esc", 32: "space", 33: "pageUp", 34: "pageDown", 35: "end",
	36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 44: "printScrn", 45: "insert",
	46: "delete", 59: ";", 91: "mod", 92: "mod", 93: "mod", 186: ";", 187: "=", 188: ",",
	189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'", 63276: "pageUp",
	63277: "pageDown", 63275: "end", 63273: "home", 63234: "left", 63232: "up", 63235: "right",
	63233: "down", 63302: "insert", 63272: "delete"
};
keyBindings.keyNames = keyNames;
(function () {
	// Number keys
	for (var i = 0; i < 10; i++) keyNames[i + 48] = String(i);
	// Alphabetic keys
	for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i).toLowerCase();
	// Function keys
	for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "f" + i;
})();