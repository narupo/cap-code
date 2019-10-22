const vscode = require('vscode');
const txtCmd = require('./text-command/text-command.js');
const inputBoxCmd = require('./input-box-command/input-box-command')

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
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
