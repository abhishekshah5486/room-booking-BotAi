// function validateEmail(email) {
//     // Define the regex for a valid email address
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
//     // Test the email against the regex
//     return emailRegex.test(email);
//   }
  
//   // Example usage
//   const email = "test@ms.#";
//   if (validateEmail(email)) {
//     console.log("Valid email address");
//   } else {
//     console.log("Invalid email address");
//   }
  

let response = 'The email address "abi@ms.com" is valid because it has a correct format with a valid domain ("ms.com"). Therefore, the answer is \'Yes\'.'

if (response.toLowerCase().includes('no')){
    console.log("Hi");
} else console.log("Bye");