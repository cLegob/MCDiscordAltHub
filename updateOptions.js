const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: node updateOptions.js <key> <value>');
    process.exit(1);
}

const [keyPath, value] = args;
const keys = keyPath.split('.');
const optionsFilePath = path.join(__dirname, 'options.json');

// Read and update options.json
fs.readFile(optionsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading options.json:', err);
        process.exit(1);
    }

    try {
        const options = JSON.parse(data);
        let current = options;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                console.error(`Invalid section: ${keys[i]} does not exist.`);
                process.exit(1);
            }
            current = current[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        if (current[lastKey] === undefined) {
            console.error(`Invalid key: ${lastKey} does not exist.`);
            process.exit(1);
        }

        // Determine the type of the value and assign it accordingly
        let newValue;
        if (value.toLowerCase() === 'true') {
            newValue = true;
        } else if (value.toLowerCase() === 'false') {
            newValue = false;
        } else if (!isNaN(value) && value.trim() !== '') {
            newValue = parseInt(value, 10); // or parseFloat(value) if you want to allow floating-point numbers
        } else {
            newValue = value;
        }

        current[lastKey] = newValue;

        fs.writeFile(optionsFilePath, JSON.stringify(options, null, 4), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to options.json:', writeErr);
                process.exit(1);
            }
            console.log(`Updated ${keyPath} to ${current[lastKey]}`);
        });
    } catch (jsonErr) {
        console.error('Error parsing JSON:', jsonErr);
        process.exit(1);
    }
});
