const vscode = require('vscode');
const utils = require('../core/utils.js');
const parsers = require('../core/parsers.js');

function setIndents(text, spaces) {
	let dst = '';
	let m = 'indent';

	for (let i = 0; i < text.length; ) {
		const c = text[i];
		switch (m) {
		case 'indent':
			dst += spaces;
			m = 'read line';
			break;
		case 'read line':
			if (c == '\n') {
				m = 'indent';
				dst += c
			} else {
				dst += c;
			}
			++i;
			break;
		}
	}

	return dst;
}

/**
 * Execute Cap's command line on editor
 * 
 * @param { } editor 
 * @param {String} cmdLine Cap's command line with start with '@' character
 */
async function execCmdLine(editor, cmdLine) {
	if (editor == null || cmdLine == null) {
		return;
	}
	
	const stdinText = await utils.getClip();
	const curPos = utils.getCursorPos(editor);
	const { argv, atPos, spaces } = parsers.parseCapCmdLine(cmdLine);

	let stdout, stderr;
	try {
		const result = await utils.runProc('cap', argv, stdinText);
		stdout = result.stdout;
		stderr = result.stderr;
	} catch (err) {
		editor.edit(edit => {
			edit.delete(delRange);
		});
		const msg = err.message.slice(err.message.search('Error:'));
		vscode.window.showErrorMessage(msg);
		return;
	}

	stdout = setIndents(stdout, spaces);

	editor.edit(edit => {
		const delStart = new vscode.Position(curPos.line, 0);
		const delEnd = new vscode.Position(curPos.line+1, 0);
		const delRange = new vscode.Range(delStart, delEnd);
		edit.delete(delRange);

		const insertPos = new vscode.Position(curPos.line+1, 0);
		edit.insert(insertPos, stdout);
	});

	// change cursor position. after inserted position
	const line = curPos.line + utils.countNewlines(stdout);
	const newPosition = new vscode.Position(line, 0);
	const newSelection = new vscode.Selection(newPosition, newPosition);
	editor.selection = newSelection;

	if (stderr && stderr.length) {
		vscode.window.showErrorMessage(stderr);
	}
}

function exec() {
	const editor = vscode.window.activeTextEditor;
	const cmdLine = utils.getCurLine(editor);
	execCmdLine(editor, cmdLine);
}

module.exports = {
	exec,
	execCmdLine,
};
