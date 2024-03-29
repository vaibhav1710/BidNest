// const cron = require('node-cron');
// const removeExpire = require("./checkExpired");

// cron.schedule('0 * * * * *', () => {
//     try {
//         removeExpire();
//         console.log("Running Script");     // Your logic to update the status of items here
//     } catch (error) {
//         console.error('Error running CRON job:', error);
//     }
   
//   });