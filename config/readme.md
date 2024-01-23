# the config folder is necessary for the back-end api server to run
# it should contain three files:
# dev.env
# test.env
# prod.env
#
# Note: Any database compatible with Sequelize ORM can be used - Postgres versions 12-14 were used during development
#
# ----------Sample content for a typical prod.env file (remove the #s)-------------- 
# ----------------------------------------------------------------------------------
# NODE_ENV=production
# 
# PORT=5000
# 
# JWT_SECRET=Ma95LqkIL5L9q790BsKHC9xXfG
# JWT_EXPIRE=30d
# JWT_COOKIE_EXPIRE=30
# 
# CORS_ORIGIN_WHITELIST_DOMAIN=https://www.vue-social-space-church.org,https://vue-social-space-church.org,https://api.vue-social-space-church.org,https://# smtp.vue-social-space-church.org
# 
# EMAIL_VALIDATION_TARGET=https://vue-social-space-church.org/catcher?token=
# PASSWORD_RESET_TARGET=http://vue-social-space-church.org/catcherpasswordreset?token=
# 
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# SMTP_EMAIL=vue.social.space.church@gmail.com
# SMTP_PASSWORD=iosl meic aqpy bsow
# FROM_EMAIL=vue.social.space.church@gmail.com
# FROM_NAME=vue-social-space-church.org
# 
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=mypassword
# DB_DB=socialdemo
# DB_DIALECT=postgres
# DB_POOL_MAX=5
# DB_POOL_MIN=0
# DB_POOL_ACQUIRE=30000
# DB_POOL_IDLE=10000
#
# ----------------------------------------------------------------------------------


# ----------Sample content for a typical dev.env file (remove the #s)--------------- 
# ----------------------------------------------------------------------------------
# NODE_ENV=dev
# 
# PORT=5000
# 
# JWT_SECRET=Pu95LqPO75L9q790ksiKWh38XfM
# JWT_EXPIRE=30d
# JWT_COOKIE_EXPIRE=30
# 
# CORS_ORIGIN_WHITELIST_DOMAIN=http://localhost.com,http://localhost:5000/api/v1,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:8081
# 
# EMAIL_VALIDATION_TARGET=http://127.0.0.1:5173/catcher?token=
# PASSWORD_RESET_TARGET=http://127.0.0.1:5173/catcherpasswordreset?token=
# 
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# SMTP_EMAIL=myTesterEmailh@gmail.com
# SMTP_PASSWORD=plwl nsuq bsuw pwhb
# FROM_EMAIL=myTesterEmailh@gmail.com
# FROM_NAME=localhost
# 
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=mypassword
# DB_DB=socialdemo
# DB_DIALECT=postgres
# DB_POOL_MAX=5
# DB_POOL_MIN=0
# DB_POOL_ACQUIRE=30000
# DB_POOL_IDLE=10000
#
# ----------------------------------------------------------------------------------





