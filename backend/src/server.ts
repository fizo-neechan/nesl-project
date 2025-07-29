import App from "./app";

const app = new App();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.start(PORT);

export default app;
