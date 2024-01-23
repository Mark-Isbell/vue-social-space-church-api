/*
the purpose of this util file is to log a human-readable output for developers, 
meant specificially to take place in a development or test environment, not production
*/

const devLog = (logString) => {

  if (process.env.VERBOSE_LOGGING === "true") 
      {
        console.log('\n' + new Date().toString() + " " +logString); 
      }
    };
  
  module.exports = devLog;