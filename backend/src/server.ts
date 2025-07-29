import App from './app';

const PORT = process.env.PORT || 5000;
const app = new App();
app.start(Number(PORT));
