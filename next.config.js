require('dotenv').config()
const withSass = require('@zeit/next-sass')

module.exports = withSass({
  /* config options here */
  webpack: config => {
    config.node = {
      fs: 'empty'
    }
    return config
  },
  env: {
    'CHEC_PUBLIC_KEY': process.env.CHEC_PUBLIC_KEY,
    'BUILDER_API_KEY': '9086974b3923490fb841fa78124de864'
  }
})

