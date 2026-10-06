// Executa o mesmo script npm (dev ou preview) no shell e nos três microfrontends, em paralelo.
// Uso: node scripts/run-all.mjs <script>
import { spawn } from 'node:child_process';

const script = process.argv[2];
const packages = ['mfe-auth', 'mfe-cryptos', 'mfe-dashboard', 'shell'];

if (!script) {
  console.error('Informe o script: node scripts/run-all.mjs <dev|preview>');
  process.exit(1);
}

const children = packages.map((name) =>
  spawn('npm', ['run', script, '-w', `@puccrypto/${name}`], { stdio: 'inherit', shell: process.platform === 'win32' }),
);

const stopAll = () => children.forEach((child) => child.kill());

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

// Se um deles terminar, encerra os demais: o conjunto só faz sentido completo.
children.forEach((child) => child.on('exit', (code) => { stopAll(); process.exitCode ||= code ?? 0; }));
