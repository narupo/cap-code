const vscode = require('vscode');
const txtCmd = require('./text-command/text-command.js');

function test() {
	vscode.window.showInformationMessage('test');
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// @see package.json
	let disposable = vscode.commands.registerCommand('extension.cap-text-command', txtCmd.exec); 
	context.subscriptions.push(disposable);

	disposalbe = vscode.commands.registerCommand('extension.test', test)
	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
