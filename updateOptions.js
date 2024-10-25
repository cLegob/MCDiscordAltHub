const fs = require('fs');

const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Usage: node updateOptions.js <file_path> <key> <value>');
    process.exit(1);
}

const [optionsFilePath, keyPath, value] = args;
const keys = keyPath.split('.');

// Read and update the options file
fs.readFile(optionsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading ${optionsFilePath}:`, err);
        process.exit(1);
    }

    try {
        const options = JSON.parse(data);
        let current = options;

        // Traverse through keys to reach the target key's parent
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

        // Determine and set the new value based on its type
        let newValue;
        if (value.toLowerCase() === 'true') {
            newValue = true;
        } else if (value.toLowerCase() === 'false') {
            newValue = false;
        } else if (!isNaN(value) && value.trim() !== '') {
            newValue = parseFloat(value); // Allows integers and floats
        } else {
            newValue = value;
        }

        current[lastKey] = newValue;

        fs.writeFile(optionsFilePath, JSON.stringify(options, null, 4), (writeErr) => {
            if (writeErr) {
                console.error(`Error writing to ${optionsFilePath}:`, writeErr);
                process.exit(1);
            }
            console.log(`Successfully updated ${keyPath} to ${current[lastKey]}`);
        });
    } catch (jsonErr) {
        console.error('Error parsing JSON:', jsonErr);
        process.exit(1);
    }
});
