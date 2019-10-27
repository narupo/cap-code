
function parseCapCmdLine(cmdLine) {
	let m = 'first';
	let line = '';
	let atPos = 0;
	let spaces = '';

	for (let i = 0; i < cmdLine.length; ++i) {
		const c = cmdLine[i];
		switch (m) {
		case 'first':
			if (c == '@') {
				m = 'found @';
				atPos = i;
			} else {
				spaces += c;
			}
			break;
        case 'found @':
			line += c;
			break;
		}
	}

	const argv = line.split(' ');

	return { argv, atPos, spaces };
}

module.exports = {
    parseCapCmdLine,
};
