module.exports = {
  apps : [{
    name   : "Foxsite",
    script : "./server/index.js",
    watch: true,
    env: {
      "NODE_ENV": "production",
      "HOST": "0.0.0.0"
   }
  }]
}   
