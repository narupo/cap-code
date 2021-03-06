const vscode = require('vscode');
const cp = require('child_process');
const utils = require('../core/utils');

function splitStdout(cmd, sep, done, fail) {
	cp.exec(cmd, (err, stdout, stderr) => {
		if (err) {
			fail(err);
			return;
		}
		if (stderr) {
			fail(stderr);
			return;
		}
		if (stdout) {
			const aliases = stdout.split(sep);
			done(aliases);
		}
	})
}

async function getAliases(done, fail) {
	let aliases = [];

	splitStdout('cap alias -g', '\n', list => {
		aliases = aliases.concat(list);
		splitStdout('cap alias', '\n', list => {
			aliases = aliases.concat(list);
			done(aliases);
		});
	});
}

let __completions = [];

function aliasesToCompletions(aliases) {
    let comps = [];

    for (let i = 0; i < aliases.length; ++i) {
        const al = aliases[i];
        const label = al;
        const insertText = al.split(' ')[0];
        let comp = new vscode.CompletionItem(label);
        comp.insertText = insertText;
        comps.push(comp);
    }

    return comps
}

function updateCompletions(done=null) {
	getAliases(aliases => {
		__completions = aliasesToCompletions(aliases);
		if (typeof done === 'function') {
			done();
		}
	});
}

function onCmdLine() {
	const editor = vscode.window.activeTextEditor;
	const line = utils.getCurLine(editor);
	if (line && line.search('@') >= 0) {
		return true;
	}
	return false;
}

function createProvider() {
	updateCompletions(); // first call
	return vscode.languages.registerCompletionItemProvider('plaintext', {
		provideCompletionItems(document, position, token) {
			if (onCmdLine()) {
				updateCompletions();
			}
			return __completions;
		},
	});
}

module.exports = {
    createProvider,
};
