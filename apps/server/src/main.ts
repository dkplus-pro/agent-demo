import { createServerApp } from './app.ts';
import { loadServerConfig } from './config.ts';

const config = loadServerConfig();
const app = createServerApp(config);

app.listen(config.port, () => {
  console.log(`Agent MVP server listening on http://localhost:${config.port}`);
});
