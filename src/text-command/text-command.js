const vscode = require('vscode');
const utils = require('../core/utils.js');
const parsers = require('../core/parsers.js');

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
	const { argv, atPos } = parsers.parseCapCmdLine(cmdLine);
	const delStart = new vscode.Position(curPos.line, atPos);
	const delEnd = new vscode.Position(curPos.line+1, 0);
	const delRange = new vscode.Range(delStart, delEnd);

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

	editor.edit(edit => {
		edit.delete(delRange);
		edit.insert(curPos, stdout);
	});

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
