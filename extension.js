const vscode = require('vscode');
const cp = require('child_process');
const stream = require('stream');

function getClip() {
	return new Promise(async (resolve, reject) => {
		let text;
		try {
			text = await vscode.env.clipboard.readText();
		} catch (err) {
			console.error('failed to get clip.', err);
			reject(err);
			return;
		}

		resolve(text);
	});
}

function getCursorPos(editor) {
	let cursorPosition = null;
    if (editor.selection.isEmpty) {
	  cursorPosition = editor.selection.active;
	}

	return cursorPosition;
}

function getCurLine(editor) {
	const cursorPosition = getCursorPos(editor);
	if (cursorPosition == null) {
		return '';
	}

	const range = new vscode.Range(cursorPosition.line, 0, cursorPosition.line, 1000);
	return line = editor.document.getText(range);
}

function parseCapCmdLine(cmdLine) {
	let m = 'first';
	let line = '';
	let atPos = 0;

	for (let i = 0; i < cmdLine.length; ++i) {
		const c = cmdLine[i];
		switch (m) {
		case 'first':
			if (c == '@') {
				m = 'found @';
				atPos = i;
			}
			break;
        case 'found @':
			line += c;
			break;
		}
	}

	const argv = line.split(' ');

	return { argv, atPos };
}

function runProc(argv, stdinText) {
	return new Promise((resolve, reject) => {
		const child = cp.execFile('cap', argv, (err, stdout, stderr) => {
			if (err) {
				console.error('failed to execute cap.', err);
				reject(err);
				return;
			}
			resolve({ stdout, stderr });
		});

		try {
			let stdinStream = new stream.Readable();
			stdinStream.push(stdinText);
			stdinStream.push(null);
			stdinStream.pipe(child.stdin);
		} catch (err) {
			console.error('failed to pipe.', err);
			reject(err);
		}
	});
}

async function execCmd() {
	const editor = vscode.window.activeTextEditor;
	const curPos = getCursorPos(editor);
	const stdinText = await getClip();
	const line = getCurLine(editor);
	const { argv, atPos } = parseCapCmdLine(line);
	const delStart = new vscode.Position(curPos.line, atPos);
	const delEnd = new vscode.Position(curPos.line+1, 0);
	const delRange = new vscode.Range(delStart, delEnd);

	let stdout, stderr;
	try {
		const result = await runProc(argv, stdinText);
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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// @see package.json
	let disposable = vscode.commands.registerCommand('extension.cap', execCmd); 
	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
