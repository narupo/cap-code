const vscode = require('vscode');
const utils = require('../core/utils.js');
const parsers = require('../core/parsers.js');

async function exec() {
    const editor = vscode.window.activeTextEditor;
    if (editor == null) {
        return;
    }

	let cmdLine = await vscode.window.showInputBox({
		prompt: '@',
    });
    if (cmdLine == null) {
        return;
    }
    cmdLine = '@' + cmdLine

	const stdinText = await utils.getClip();
	const curPos = utils.getCursorPos(editor);
	const { argv, atPos } = parsers.parseCapCmdLine(cmdLine);

	let stdout, stderr;
	try {
		const result = await utils.runProc('cap', argv, stdinText);
		stdout = result.stdout;
		stderr = result.stderr;
	} catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err.message);
		return;
    }

    if (stdout && stdout.length) {
        vscode.window.showInformationMessage(stdout);
    }
    if (stderr && stderr.length) {
        vscode.window.showErrorMessage(stderr);
    }
}

module.exports = {
    exec,
};
