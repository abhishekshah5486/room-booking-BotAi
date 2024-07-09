// Example text input
let userInput = "mujhe 6 din kelie room book karna h";

// Regular expression to match numbers
let numberRegex = /\d+/;

// Extract the number from the text
let matches = userInput.match(numberRegex);
console.log(matches[0]);
