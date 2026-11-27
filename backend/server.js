import app from "./index.js";

let port = Number(process.env.PORT) || 5000;

app.listen(port, "127.0.0.1", () => {
  console.log(`Snowstep API listening on 127.0.0.1:${port}`);
});
