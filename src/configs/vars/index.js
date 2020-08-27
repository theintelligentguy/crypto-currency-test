const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../../.env'),
  sample: path.join(__dirname, '../../../.env.example'),
});
module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  domain: process.env.DOMAIN,
  mongo: {
    uri: process.env.MONGO_DB
  },
  changeNowApi: process.env.CHANGE_NOW_API,
  simpleSwalApi: process.env.SIMPLE_SWAP_API,
  faaStFixedFee: process.env.FAAST_FIXED_FEE,
  faaStAffiliateMargin: process.env.FAAST_AFFILIATE_MARGIN,
  changelly_api: process.env.CHANGELLY_API,
  changelly_secret: process.env.CHANGELLY_SECRET,
  godex_api: process.env.GODEX_API,
  change_hero_api: process.env.CHANGE_HERO_API,
  change_hero_secret: process.env.CHANGE_HERO_SECRET
};
