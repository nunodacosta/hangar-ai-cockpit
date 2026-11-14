const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

// A Store exige quatro componentes e reserva o quarto para si (tem de ir a 0).
const versionParts = String(pkg.version).split('.');
if (!/^\d+(\.\d+){1,3}$/.test(String(pkg.version)) || versionParts.length > 4) {
  console.error(`Versao invalida em package.json: "${pkg.version}". Use por exemplo 1.1.2.`);
  process.exit(1);
}
while (versionParts.length < 4) versionParts.push('0');
const [major, minor, patch, revision] = versionParts.map(Number);
if (major < 1 || [major, minor, patch, revision].some(part => !Number.isInteger(part) || part < 0 || part > 65535)) {
  console.error(`Versao fora dos limites do manifesto: ${versionParts.join('.')}`);
  process.exit(1);
}
if (revision !== 0) {
  console.error('O quarto componente da versao e reservado pela Store e tem de ser 0.');
  process.exit(1);
}
const msixVersion = versionParts.join('.');

function findMakeAppx() {
  const kits = 'C:/Program Files (x86)/Windows Kits/10/bin';
  if (fs.existsSync(kits)) {
    const versions = fs.readdirSync(kits)
      .filter(name => /^\d+\.\d+\.\d+\.\d+$/.test(name))
      .sort((a, b) => {
        const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
        for (let i = 0; i < 4; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
        return 0;
      })
      .reverse();
    for (const version of versions) {
      const candidate = path.join(kits, version, 'x64', 'makeappx.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return 'makeappx.exe';
}

const unpacked = path.join(root, 'dist', 'win-unpacked');
if (!fs.existsSync(unpacked)) {
  console.error('Falta dist/win-unpacked. Execute primeiro: npm run dist:dir');
  process.exit(1);
}

// Recusa empacotar uma compilacao mais antiga do que o codigo que vai ser publicado.
const shipped = [
  path.join(root, 'package.json'), path.join(root, 'main.js'),
  path.join(root, 'preload.js'), path.join(root, 'server.js'),
  path.join(root, 'build', 'icon.ico'), path.join(root, 'build', 'icon.png')
];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
shipped.push(...walk(path.join(root, 'public')));
const asar = path.join(unpacked, 'resources', 'app.asar');
const newestSource = Math.max(...shipped.map(file => fs.statSync(file).mtimeMs));
if (fs.existsSync(asar) && newestSource > fs.statSync(asar).mtimeMs + 1000 && process.env.MSIX_ALLOW_STALE !== '1') {
  console.error('dist/win-unpacked esta desatualizado face ao codigo. Execute: npm run dist:dir');
  console.error('(Para empacotar mesmo assim: $env:MSIX_ALLOW_STALE = "1")');
  process.exit(1);
}

const manifestSource = path.join(root, 'build', 'appx', 'AppxManifest.xml');
let manifest = fs.readFileSync(manifestSource, 'utf8')
  .replace(/Version="\d+\.\d+\.\d+\.\d+"/, `Version="${msixVersion}"`);

const currentName = (manifest.match(/<Identity[\s\S]*?Name="([^"]*)"/) || [])[1];
const currentPublisher = (manifest.match(/<Identity[\s\S]*?Publisher="([^"]*)"/) || [])[1];
const identityName = (process.env.MSIX_NAME || currentName || '').trim();
const identityPublisher = (process.env.MSIX_PUBLISHER || currentPublisher || '').trim();
if (!/^[A-Za-z0-9.-]{1,50}$/.test(identityName)) {
  console.error('MSIX_NAME invalido. Use apenas letras, numeros, pontos e hifens (max. 50).');
  process.exit(1);
}
if (!/^CN=\S.*/.test(identityPublisher)) {
  console.error('MSIX_PUBLISHER tem de comecar por CN=, tal como o Partner Center o apresenta.');
  process.exit(1);
}
if (/CN=0{8}-0{4}-0{4}-0{4}-0{12}/.test(identityPublisher)) {
  console.error('O Publisher ainda e o valor de exemplo. Defina MSIX_PUBLISHER com o valor do Partner Center.');
  process.exit(1);
}
manifest = manifest
  .replace(/(<Identity[\s\S]*?Name=")[^"]*(")/, `$1${identityName}$2`)
  .replace(/(<Identity[\s\S]*?Publisher=")[^"]*(")/, `$1${identityPublisher}$2`);

// Assets referenciados pelo manifesto (as variantes .scale-* sao opcionais).
const assets = ['StoreLogo.png', 'Square44x44Logo.png', 'Square150x150Logo.png', 'Wide310x150Logo.png', 'SplashScreen.png'];
const missing = assets.filter(name => !fs.existsSync(path.join(root, 'build', 'appx', 'Assets', name)));
if (missing.length) {
  console.error(`Faltam assets do pacote: ${missing.join(', ')}`);
  process.exit(1);
}

const layout = path.join(root, 'dist', 'appx-layout');
fs.rmSync(layout, { recursive: true, force: true });
fs.mkdirSync(layout, { recursive: true });
fs.cpSync(unpacked, layout, { recursive: true });
fs.cpSync(path.join(root, 'build', 'appx', 'Assets'), path.join(layout, 'Assets'), { recursive: true });
fs.writeFileSync(path.join(layout, 'AppxManifest.xml'), manifest);

const executable = (manifest.match(/<Application[^>]*Executable="([^"]+)"/) || [])[1];
if (!executable || !fs.existsSync(path.join(layout, executable))) {
  console.error(`O executavel declarado no manifesto nao existe no pacote: ${executable || '(ausente)'}`);
  process.exit(1);
}

const output = path.join(root, 'dist', `Hangar_${msixVersion}_x64.appx`);
fs.rmSync(output, { force: true });

const makeappx = findMakeAppx();
console.log(`makeappx: ${makeappx}`);
execFileSync(makeappx, ['pack', '/d', layout, '/p', output, '/o'], { stdio: 'inherit' });

const digest = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
fs.writeFileSync(`${output}.sha256`, `${digest}  ${path.basename(output)}\n`);

const size = fs.statSync(output).size;
console.log(`Pacote criado: ${output} (${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Identidade:    ${identityName}`);
console.log(`Publisher:     ${identityPublisher}`);
console.log(`Versao:        ${msixVersion} (x64)`);
console.log(`SHA256:        ${digest}`);
