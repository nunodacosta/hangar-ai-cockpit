#!/usr/bin/env node
/**
 * Verifica um pacote .appx/.msix antes de o submeter ao Partner Center.
 *
 * Uso:
 *   npm run store:verify                      # dist/Hangar_<versao>_x64.appx
 *   npm run store:verify -- caminho\pacote.appx
 *
 * Confirma a identidade do Partner Center, a versao, o executavel, os assets
 * (byte a byte contra build/appx/Assets) e o estado da assinatura; no fim
 * imprime tamanho e SHA-256 do pacote.
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const EXPECTED = {
  name: (process.env.MSIX_NAME || 'AlexandredaCosta.HangarAICockpit').trim(),
  publisher: (process.env.MSIX_PUBLISHER || 'CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3').trim(),
  displayName: (pkg.build && pkg.build.productName) || 'Hangar AI Cockpit',
  version: `${pkg.version}.0`,
};

function fail(message) {
  console.error(`FALHA: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`  ok    ${message}`);
}

function findMakeAppx() {
  const kits = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Windows Kits', '10', 'bin');
  if (fs.existsSync(kits)) {
    for (const version of fs.readdirSync(kits).sort().reverse()) {
      const candidate = path.join(kits, version, 'x64', 'makeappx.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return 'makeappx.exe';
}

function attribute(block, name) {
  const match = block.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function listAssets(dir) {
  return fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.png')).sort();
}

const packagePath = path.resolve(process.argv[2] || path.join(root, 'dist', `Hangar_${EXPECTED.version}_x64.appx`));
if (!fs.existsSync(packagePath)) {
  console.error(`Pacote nao encontrado: ${packagePath}`);
  console.error('Gerar primeiro com: npm run store');
  process.exit(1);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'hangar-appx-verify-'));
console.log(`Pacote: ${path.relative(root, packagePath)}`);

try {
  execFileSync(findMakeAppx(), ['unpack', '/p', packagePath, '/d', temp, '/o'], { stdio: 'ignore' });

  const manifestPath = path.join(temp, 'AppxManifest.xml');
  if (!fs.existsSync(manifestPath)) {
    fail('AppxManifest.xml ausente no pacote');
    throw new Error('manifesto ausente');
  }
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const identity = manifest.match(/<Identity\b[^>]*>/);
  if (!identity) {
    fail('elemento <Identity> ausente no manifesto');
    throw new Error('identidade ausente');
  }

  const checks = [
    ['Package/Identity/Name', attribute(identity[0], 'Name'), EXPECTED.name],
    ['Package/Identity/Publisher', attribute(identity[0], 'Publisher'), EXPECTED.publisher],
    ['Version', attribute(identity[0], 'Version'), EXPECTED.version],
    ['ProcessorArchitecture', attribute(identity[0], 'ProcessorArchitecture'), 'x64'],
  ];

  for (const [label, actual, expected] of checks) {
    if (actual === expected) pass(`${label} = ${actual}`);
    else fail(`${label} = ${actual || '(ausente)'} (esperado ${expected})`);
  }

  const display = (manifest.match(/<DisplayName>([^<]*)<\/DisplayName>/) || [])[1];
  if (display === EXPECTED.displayName) pass(`DisplayName = ${display}`);
  else fail(`DisplayName = ${display || '(ausente)'} (esperado ${EXPECTED.displayName})`);

  const executable = (manifest.match(/Executable="([^"]+)"/) || [])[1];
  if (executable && fs.existsSync(path.join(temp, executable))) pass(`Executable presente: ${executable}`);
  else fail(`Executable ausente no pacote: ${executable || '(nao declarado)'}`);

  const refs = [...new Set([...manifest.matchAll(/Assets[\\/]([A-Za-z0-9._-]+\.png)/g)].map((m) => m[1]))].sort();
  const missingRefs = refs.filter((name) => !fs.existsSync(path.join(temp, 'Assets', name)));
  if (refs.length && !missingRefs.length) pass(`${refs.length} referencias de Assets resolvem`);
  else fail(`Assets referenciados em falta: ${missingRefs.join(', ') || '(sem referencias)'}`);

  const sourceDir = path.join(root, 'build', 'appx', 'Assets');
  const source = listAssets(sourceDir);
  const packedDir = path.join(temp, 'Assets');
  const packed = fs.existsSync(packedDir) ? listAssets(packedDir) : [];
  const missing = source.filter((name) => !packed.includes(name));
  const extra = packed.filter((name) => !source.includes(name));
  const different = source.filter(
    (name) =>
      packed.includes(name) &&
      sha256(fs.readFileSync(path.join(sourceDir, name))) !== sha256(fs.readFileSync(path.join(packedDir, name))),
  );

  if (!missing.length && !extra.length && !different.length) {
    pass(`${source.length} assets iguais a build/appx/Assets`);
  } else {
    if (missing.length) fail(`assets em falta no pacote: ${missing.join(', ')}`);
    if (extra.length) fail(`assets a mais no pacote: ${extra.join(', ')}`);
    if (different.length) fail(`assets diferentes de build/appx/Assets: ${different.join(', ')}`);
  }

  if (fs.existsSync(path.join(temp, 'AppxSignature.p7x'))) {
    console.log('  aviso pacote assinado; para o Partner Center deve ir sem assinatura');
  } else {
    pass('sem assinatura (a Store assina)');
  }

  const bytes = fs.readFileSync(packagePath);
  console.log(`\nTamanho: ${bytes.length} bytes (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`SHA-256: ${sha256(bytes)}`);
  console.log(process.exitCode ? '\nPacote NAO pronto para submeter.' : '\nPacote pronto para submeter.');
} catch (error) {
  if (!process.exitCode) {
    console.error(`FALHA: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
