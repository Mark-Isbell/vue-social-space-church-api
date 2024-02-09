# vue-social-space-church API

> Backend API for the vue-social-space-church application

Demonstration Implementation: https://vue-social-space-church.org

Front end code is here: https://github.com/Mark-Isbell/vue-social-space-church

## Usage
Change contents of the three dotenv files to your own values: dev.env | prod.env | test.evn
To learn more, read the readme file in the config folder 

Note: Any database compatible with the Sequelize ORM can be used - Postgres versions 12-14 were used during development

## Install Dependencies
npm install

## Edit your own custom .env files
In the config folder is a separate readme file for instructions on how to create 
your own .env files for different environments

Note: These .env files MUST be present for the server to run

## Sync the database via API call
Create empty database that matches expected name in your dbConfig.js file

Then run the API call using a simple GET in browser or API tool:  {yourBackEndDomain}/api/v1//sequelizesync/synchardinitialchurchsetup

Note: The API call will create all tables and one moderator login to enable functioning front end
Note: Initial login is: user: moderator | email: moderator@email.com | password: password  

## Run App

```
# Run in dev mode
npm run dev

# Run in test mode
npm run test

# Run in prod mode
npm run prod
```

- Version: 1.0.0
- License: MIT
