const fs = require("fs");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const bcrypt = require('bcryptjs');
const { Sequelize, Model} = require('sequelize');
const db = require("../models");
const devLog = require("../utils/devLog");

//  @desc   sync db with model:  syncHard:  drops tables if they already exist and starts everything fresh
//          will create initial set of sample church data, complete with members and moderators
//          to log in, a database administrator will need to retreive emails
//          all passwords, however, are 'password'
//  @route  GET /api/v1//sequelizesync/syncharddemodata
//  @access Public
exports.syncHardDemoData = asyncHandler(async (req, res, next) => {
    devLog("syncHardDemoData controller method activated"); 

    // safety check for a church record before proceeding
    try{
      // expectation is that this fails
      // if not, then synchard will not proceed
      // as data or an existing db will be destroyed
      const church = await db.churches.findOne();
      // if church table exists that means data probably exists also
      // so not proceeding.  Expectation is an empty database with no tables or data
      res.status(200).json({
        success: false,
        context: "Not proceeding. Expectation is empty database but instead found tables or data.",
        seederDataCreated: false,
        calledSuccessfully: "success",
      });
    }
    catch(error) {
        devLog("synchard and creation of seeder data about to proceed"); 
        await db.sequelize.sync({force: true}); 
        
        // create initial data
        let createdOrNot = false; 
        try{
          createdOrNot = await createSeederData();
        }
        catch(error) {
          devLog("error caught in creating seederData: " + JSON.stringify(error)); 
        }
        
        res.status(200).json({
          success: true,
          seederDataCreated: createdOrNot,
          calledSuccessfully: "success",
        });
      }
  });

//  @desc   sync db with model:  syncHard:  drops tables if they already exist and starts everything fresh
//          will also create one starting moderator and church account which can then be edited by user on front end
//          Login: [  Email: moderator@email.com | Username: moderator | Password: password  ]  
//  @route  GET /api/v1//sequelizesync/synchardinitialchurchsetup
//  @access Public
exports.syncHardInitialChurchSetUp = asyncHandler(async (req, res, next) => {

  devLog("syncHardInitialChurchSetUp controller method activated"); 

    // safety check for a church record before proceeding
    try{
      // expectation is that this fails
      // if not, then synchard will not proceed
      // as data or an existing db will be destroyed
      const church = await db.churches.findOne();

      // if church table exists that means data probably exists also
      // so not proceeding.  Expectation is an empty database with no tables or data
      res.status(200).json({
        success: false,
        context: "Not proceeding. Expectation is empty database but instead found tables or data.",
        seederDataCreated: false,
        calledSuccessfully: "success",
      });
    }
    catch(error) {
      await db.sequelize.sync({force: true}); 

      // create initial data
      let createdOrNot = false; 
      try{
        createdOrNot = await createInitialData();
      }
      catch(error) {
        devLog("error caught in creating initial data: " + JSON.stringify(error)); 
      }
      
      res.status(200).json({
        success: true,
        initialDataCreated: createdOrNot,
        calledSuccessfully: "success",
      });
    }
  });

  async function  createInitialData() {
    try {
    // create one church
  
      let churchObject = 
      {
        "name": "Church name goes here",
        "country": "country goes here",
        "street1": "Street address line 1 goes here",
        "street2": "",
        "city": "City goes here",
        "state": "NN",
        "zip": 99999,
        "intStateProvinceRegion": "NN",
        "intZipPostal": "Post: " + 9999999,
        "invitationCode": getInviteCode()
      }
        const church = await db.churches.create(churchObject);

        // create church stream record
        const stream = await db.streams.create({
          name: "church",
          status: "active",
          type: "church",
        })
     
    }

    catch(error) {
      devLog("ERROR during CHURCH seeder data creation: " + '\n' + JSON.stringify(error) + '\n')
    return false;
    }

    try {
      // create one moderator record      
        let memberRole = "moderator";  
        let currentStreamId = 1;
        let memberObject = 
        {
          "userName": "moderator",
          "email": "moderator" + "@" + "email.com",
          "password": bcrypt.hashSync("password", 8),
          "isEmailConfirmed": "yes",
          "role": memberRole,
          "currentStreamId": currentStreamId
        }
        const member = await db.members.create(memberObject);

        const streammember = await db.streammembers.create({
          participantType: member.role,
          status: "normal",
          memberId: member.id,
          streamId: member.currentStreamId
        });
        }
        catch (error) {
          devLog("Error during MODERATOR creation in initial church setup: " + JSON.stringify(error)); 
          return false;
        }
        return true;
  }

async function  createSeederData() {

    try {
        // create one church
   
        let churchObject = 
        {
          "name": createRandomWord(10) + " Church",
          "country": getRandomCountry(),
          "street1": createRandomInteger(9999).toString() + " " + " 4th street",
          "street2": "",
          "city": createRandomWord(5) + " City",
          "state": getRandomState(),
          "zip": createRandomInteger(50000),
          "intStateProvinceRegion": getRandomProvince(),
          "intZipPostal": "Post: " + createRandomInteger(9999999),
          "invitationCode": getInviteCode()
        }
          const church = await db.churches.create(churchObject);

          // create church stream record
          const stream = await db.streams.create({
            name: "church",
            status: "active",
            type: "church",
          })
     
    }

    catch(error) {
      devLog("ERROR during CHURCH seeder data creation: " + '\n' + JSON.stringify(error) + '\n')
    return false;
    }
    
  try {
    // create members
    let isModerator = false;
        for (let i=0;i<300;i++) {
              // set moderator flag every 25 members
              isModerator = false;
              let memberRole = "member";
              let lastTwo = i.toString().slice(-2);
              if (lastTwo==="25" || lastTwo ==="00" || lastTwo ==="50" || lastTwo ==="75")
              {isModerator= true;}
              if(isModerator===true) 
              {memberRole="moderator";}

              let currentStreamId = 1;

              let memberObject = 
              {
                "userName": createRandomWord(10),
                "email": createRandomWord(5) + "@" + "email.com",
                "password": bcrypt.hashSync("password", 8),
                "isEmailConfirmed": "yes",
                "role": memberRole,
                "currentStreamId": currentStreamId
              }
              const member = await db.members.create(memberObject);

              const streammember = await db.streammembers.create({
                participantType: member.role,
                status: "normal",
                memberId: member.id,
                streamId: member.currentStreamId
              });
        }
      }
      catch (error) {
        devLog("Error during MEMBER seeder data creation: " + JSON.stringify(error)); 
        return false;
      }
      
      try {
              // create streamcomments
              const allStreamMembers = await db.streammembers.findAll({
                attributes: ['id','streamId'],
                include: [{
                  model: db.members,
                  as: 'member', 
                  attributes: [['id','memberId'],'userName']   
                }]
              })

              devLog("about to start the FOR loop in creating stream comments")
              for(let i=0;i<allStreamMembers.length;i++) {

                // create three comments per stream member
                for(let m=0;m<3;m++) {
                  let streamCommentObject =    {          
                    "streammemberId": allStreamMembers[i].id,
                    "streamId": allStreamMembers[i].streamId,
                    "comment": "&lt;p>" + allStreamMembers[i].member.userName + ": " + getRandomComment(),
                    "status": getRandomStatus()
                  }
                  const streamcomment = await db.streamcomments.create(streamCommentObject);
                }
              }
          }
          catch (error) {
            devLog("Error during STREAMCOMMENTS seeder data creation: " + JSON.stringify(error)); 
            return false;
          }

          // create one moderator record with static data
          try {   
              let memberRole = "moderator";  
              let currentStreamId = 1;
              let memberObject = 
              {
                "userName": "moderator",
                "email": "moderator" + "@" + "email.com",
                "password": bcrypt.hashSync("password", 8),
                "isEmailConfirmed": "yes",
                "role": memberRole,
                "currentStreamId": currentStreamId
              }
              const member = await db.members.create(memberObject);
      
              const streammember = await db.streammembers.create({
                participantType: member.role,
                status: "normal",
                memberId: member.id,
                streamId: member.currentStreamId
              });
              }
              catch (error) {
                devLog("Error during static MODERATOR seeder data creation: " + JSON.stringify(error)); 
                return false;
              }

          // create one member record with static data
          try {   
            let memberRole = "member";  
            let currentStreamId = 1;
            let memberObject = 
            {
              "userName": "member",
              "email": "member" + "@" + "email.com",
              "password": bcrypt.hashSync("password", 8),
              "isEmailConfirmed": "yes",
              "role": memberRole,
              "currentStreamId": currentStreamId
            }
            const member = await db.members.create(memberObject);
    
            const streammember = await db.streammembers.create({
              participantType: member.role,
              status: "normal",
              memberId: member.id,
              streamId: member.currentStreamId
            });
            }
            catch (error) {
              devLog("Error during static MEMBER seeder data creation: " + JSON.stringify(error)); 
              return false;
            }
              

      return true;
}

function createRandomWord(length) {
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
  let randomWord = "";
  for (let w=0;w<length;w++) {
    let rando = Math.floor(Math.random()*26) 
    randomWord = randomWord + letters[rando];
  }
  return randomWord;
}

function createRandomInteger(max) {
  let rando = Math.floor(Math.random()*(max)-1) + 1
  return rando;
}

function getInviteCode () {
  const chars = ["A","B","C","E","F","G","H","I","K","L","P","Q","R","T","2","3","4","6","7","8","9","Y","U","W","X","Z","V"]
  newCode = []
  for (let i=0;i<40;i++) {
      let rando = Math.floor(Math.random()*26)
      if (rando > 26) {continue}
      newCode.push(chars[rando]);
      if (newCode.length > 7)
      {break;}
  }
  let inviteCode = "" + newCode[0] + newCode[1] + newCode[2] + newCode[3] + newCode[4] + newCode[5] + newCode[6];
  
  return inviteCode;
}

function getRandomCountry() {
 const countryList = ["Canada", "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and/or Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecudaor", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France, Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kosovo", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfork Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbarn and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States minor outlying islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virigan Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zaire", "Zambia", "Zimbabwe"]
  randomNumber = createRandomInteger(4)
  if(randomNumber < 3) { return "United States"}
  else {
    newRandomNumber = createRandomInteger(240)
    return countryList[newRandomNumber];
  }
}

function getRandomState() {
const stateList = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
randomNumber = createRandomInteger(49)
return stateList[randomNumber]
}

function getRandomProvince() {
const provinceList = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
randomNumber = createRandomInteger(12)
return provinceList[randomNumber]
}

function getRandomComment() {
const commentList = ["Ha!", "lol 🤣", "Interesting ... I'll explain in a minute", "🙋 Hello people!  I am back online finally.  The trip I took out East is done.", "Ha ha very funny! 😆 ", "Hey does anybody know where to bring a tire that slowly loses air pressure?", "All right ... got to go for a bit...", "The weather is supposed to be atrocious tonight", "Did anybody else think of a specific Bible verse during the sermon last Sunday?", "My grandson is enjoying the church choir", "Time to get a hot beverage before I sit down and read this book... 😑", "okay...", "Interesting @someuser, I was just thinking the same thing.", "Who thinks the Bears are going to lose to Green Bay tonight?", "Guess what this Tik Tok video is about? 🤩", "My phone keeps not allowing me to type correctly. 🤣", "Are Hondas the most dependable car?  I'm thinking of buying one on Tuesday from an ad in Craigs List...", "Nope", "What? 😁", "All right, time to go!", "Can't wait for the study group on Wednesday.", "Does anybody know if Robert is still around?  He used to attend every once in a while.", "People have been driving their cards unpredictably lately.  Has anbybody else noticed?"]
let rando = createRandomInteger(21)
return commentList[rando]
}

function getRandomStatus() {
  let rando = createRandomInteger(20)
  if (rando > 18) { return "hidden"}
  else {return "visible"}
}