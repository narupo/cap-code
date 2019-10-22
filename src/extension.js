const vscode = require('vscode');
const txtCmd = require('./text-command/text-command');
const inputBoxCmd = require('./input-box-command/input-box-command')
const completions = require('./completions/completions');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// @see package.json
	let disposable;
	
	disposable = vscode.commands.registerCommand('extension.cap-text-command', txtCmd.exec); 
	context.subscriptions.push(disposable);

	disposalbe = vscode.commands.registerCommand('extension.cap-input-box-command', inputBoxCmd.exec);
	context.subscriptions.push(disposable);

	const completionsProvider = completions.createProvider();
	context.subscriptions.push(completionsProvider);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
