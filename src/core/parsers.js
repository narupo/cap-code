
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

module.exports = {
    parseCapCmdLine,
};
