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

function runProc(cmd, argv, stdinText) {
	return new Promise((resolve, reject) => {
		const child = cp.execFile(cmd, argv, (err, stdout, stderr) => {
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

module.exports = {
    getClip,
    getCursorPos,
    getCurLine,
    runProc,
};