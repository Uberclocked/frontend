import { app } from "./app";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`BFF running on http://localhost:${PORT}`);
});
