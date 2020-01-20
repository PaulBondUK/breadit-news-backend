const { PORT = 9090 } = process.env;
const server = require("../app");

server.listen(PORT, () => console.log(`Listening on ${PORT}...`));
