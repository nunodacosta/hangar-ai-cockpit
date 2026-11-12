const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const parts = String(pkg.version).split('.').slice(0, 4);
while (parts.length < 4) parts.push('0');
const msixVersion = parts.join('.');

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
  console.error('Falta dist/win-unpacked. Execute primeiro: npm run dist');
  process.exit(1);
}

const manifestSource = path.join(root, 'build', 'appx', 'AppxManifest.xml');
let manifest = fs.readFileSync(manifestSource, 'utf8')
  .replace(/Version="\d+\.\d+\.\d+\.\d+"/, `Version="${msixVersion}"`);

const identityName = (process.env.MSIX_NAME || '').trim();
const identityPublisher = (process.env.MSIX_PUBLISHER || '').trim();
if (identityName) {
  manifest = manifest.replace(/(<Identity[\s\S]*?Name=")[^"]*(")/, `$1${identityName}$2`);
}
if (identityPublisher) {
  if (!/^CN=.+/.test(identityPublisher)) {
    console.error('MSIX_PUBLISHER tem de começar por CN=, tal como o Partner Center o apresenta.');
    process.exit(1);
  }
  manifest = manifest.replace(/(<Identity[\s\S]*?Publisher=")[^"]*(")/, `$1${identityPublisher}$2`);
}
if (/CN=0{8}-0{4}-0{4}-0{4}-0{12}/.test(manifest)) {
  console.warn('Aviso: Publisher ainda tem o valor de exemplo. Defina MSIX_PUBLISHER com o valor do Partner Center antes de submeter.');
}

const layout = path.join(root, 'dist', 'appx-layout');
fs.rmSync(layout, { recursive: true, force: true });
fs.mkdirSync(layout, { recursive: true });
fs.cpSync(unpacked, layout, { recursive: true });
fs.cpSync(path.join(root, 'build', 'appx', 'Assets'), path.join(layout, 'Assets'), { recursive: true });
fs.writeFileSync(path.join(layout, 'AppxManifest.xml'), manifest);

const output = path.join(root, 'dist', `Hangar_${msixVersion}_x64.appx`);
fs.rmSync(output, { force: true });

const makeappx = findMakeAppx();
console.log(`makeappx: ${makeappx}`);
execFileSync(makeappx, ['pack', '/d', layout, '/p', output, '/o'], { stdio: 'inherit' });

const size = fs.statSync(output).size;
console.log(`Pacote criado: ${output} (${(size / 1024 / 1024).toFixed(1)} MB)`);
