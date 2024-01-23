
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_DB,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: Number(process.env.DB_POOL_MAX),
      min: Number(process.env.DB_POOL_MIN),
      acquire: Number(process.env.DB_POOL_ACQUIRE),
      idle: Number(process.env.DB_POOL_IDLE)
    }
  }
);

const db = {}; // creates one 'db' object to contain ... everything.  

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.calendarevents = require("../models/Calendarevent.js")(sequelize, Sequelize);
db.churches = require("../models/Church.js")(sequelize, Sequelize);
db.churchfacts = require("../models/Churchfact.js")(sequelize, Sequelize);
db.churchlinks = require("../models/Churchlink.js")(sequelize, Sequelize);
db.directmessages = require("../models/Directmessage.js")(sequelize, Sequelize);
db.directmessagecomments = require("../models/Directmessagecomment.js")(sequelize, Sequelize);
db.directmessagemembers = require("../models/Directmessagemember.js")(sequelize, Sequelize);
db.images = require("../models/Image.js")(sequelize, Sequelize);
db.members = require("../models/Member.js")(sequelize, Sequelize);
db.memberfacts = require("../models/Memberfact.js")(sequelize, Sequelize);
db.moderatormessages = require("../models/Moderatormessage.js")(sequelize, Sequelize);
db.restricteds = require("../models/Restricted.js")(sequelize, Sequelize);
db.streams = require("../models/Stream.js")(sequelize, Sequelize);
db.streamcomments = require("../models/Streamcomment.js")(sequelize, Sequelize);
db.streammembers = require("../models/Streammember.js")(sequelize, Sequelize);

// connection to directmessagemember
db.members.hasMany(db.directmessagemembers, { as: "directmessagemembers" });
db.directmessagemembers.belongsTo(db.members, {
  foreignKey: "memberId",
  as: "member",
});

db.directmessages.hasMany(db.directmessagemembers, { as: "directmessagemembers" });
db.directmessagemembers.belongsTo(db.directmessages, {
  foreignKey:  "directmessageId",
  as: "directMessage",
});

// connection to directmessagecomment
db.directmessagemembers.hasMany(db.directmessagecomments, { as: "directmessagecomments" });
db.directmessagecomments.belongsTo(db.directmessagemembers, {
  foreignKey: "directmessagememberId",
  as: "directMessageMember",
});

db.directmessages.hasMany(db.directmessagecomments, { as: "directmessagecomments" });
db.directmessagecomments.belongsTo(db.directmessages, {
  foreignKey:  "directmessageId",
  as: "directMessage",
});

// connection to moderatormessage
db.members.hasMany(db.moderatormessages, { as: "moderatormessages" });
db.moderatormessages.belongsTo(db.members, {
  foreignKey: "keyfieldmemberId",
  as: "member",
});

db.streams.hasMany(db.moderatormessages, { as: "moderatormessages" });
db.moderatormessages.belongsTo(db.streams, {
  foreignKey: "keyfieldstreamId",
  as: "stream",
});

// connection to streammember
db.members.hasMany(db.streammembers, { as: "streammembers" });
db.streammembers.belongsTo(db.members, {
  foreignKey: "memberId",
  as: "member",
});

db.streams.hasMany(db.streammembers, { as: "streammembers" });
db.streammembers.belongsTo(db.streams, {
  foreignKey: "streamId",
  as: "stream",
});

// connection to streamcomment
db.streams.hasMany(db.streamcomments, { as: "streamcomments" });
db.streamcomments.belongsTo(db.streams, {
  foreignKey: "streamId",
  as: "stream",
});

db.streammembers.hasMany(db.streamcomments, { as: "streamcomments" });
db.streamcomments.belongsTo(db.streammembers, {
  foreignKey: "streammemberId",
  as: "streammember",
});

module.exports = db;



