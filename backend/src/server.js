const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  if (env.nodeEnv !== "production") {
    console.log(`PayZa backend running on port ${env.port}`);
  }
});
