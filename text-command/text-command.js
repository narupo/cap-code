const vscode = require('vscode');
const utils = require('../core/utils.js');
const parsers = require('../core/parsers.js');

async function exec() {
	const editor = vscode.window.activeTextEditor;
	if (editor == null) {
		return;
	}

	const stdinText = await utils.getClip();
	const curPos = utils.getCursorPos(editor);
	const line = utils.getCurLine(editor);
	const { argv, atPos } = parsers.parseCapCmdLine(line);
	const delStart = new vscode.Position(curPos.line, atPos);
	const delEnd = new vscode.Position(curPos.line+1, 0);
	const delRange = new vscode.Range(delStart, delEnd);

	let stdout, stderr;
	try {
		const result = await utils.runProc('cap', argv, stdinText);
		stdout = result.stdout;
		stderr = result.stderr;
	} catch (err) {
		console.error(err);
		editor.edit(edit => {
			edit.delete(delRange);
		});
		return;
	}

	editor.edit(edit => {
		edit.delete(delRange);
		edit.insert(curPos, stdout);
	});
}

module.exports = {
	exec,
}