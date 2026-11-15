#!/usr/bin/env node
/**
 * Gera os manifestos do winget para a versao atual.
 *
 * Uso:
 *   npm run winget                       # dist/Hangar_Setup.exe, versao do package.json
 *   npm run winget -- --setup outro.exe  # outro instalador
 *   npm run winget -- --date 2026-11-15  # data de release (por omissao, hoje)
 *
 * Escreve winget/manifests/a/ALDACO/HangarAICockpit/<versao>/ com os manifestos
 * de versao, instalador e idiomas (en-US e pt-PT). O SHA-256 e calculado a
 * partir do instalador, por isso gerar sempre depois de `npm run dist`.
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const IDENTIFIER = 'ALDACO.HangarAICockpit';
const PUBLISHER = 'ALDACO';
const PRODUCT = (pkg.build && pkg.build.productName) || 'Hangar AI Cockpit';
const REPO = 'https://github.com/nunodacosta/hangar-ai-cockpit';
const MANIFEST_VERSION = '1.10.0';
const PRODUCT_CODE = '0a5065f8-9175-5b1b-b54d-fc39f57cd14e'; // GUID estavel do NSIS (appId)

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const version = arg('version', pkg.version);
const setup = path.resolve(arg('setup', path.join(root, 'dist', 'Hangar_Setup.exe')));
const date = arg('date', new Date().toISOString().slice(0, 10));
const tag = `v${version}`;
const installerUrl = arg(
  'url',
  `https://github.com/nunodacosta/hangar-ai-cockpit/releases/download/${tag}/Hangar_Setup.exe`,
);

if (!fs.existsSync(setup)) {
  console.error(`Instalador nao encontrado: ${setup}`);
  console.error('Gerar primeiro com: npm run dist');
  process.exit(1);
}

const sha256 = crypto.createHash('sha256').update(fs.readFileSync(setup)).digest('hex').toUpperCase();
const outDir = path.join(root, 'winget', 'manifests', 'a', 'ALDACO', 'HangarAICockpit', version);

const header = (type) =>
  `# yaml-language-server: $schema=https://aka.ms/winget-manifest.${type}.${MANIFEST_VERSION}.schema.json`;

const scalar = (value) => (/[:#]|^\s|\s$/.test(value) ? JSON.stringify(value) : value);

const versionManifest = `${header('version')}
PackageIdentifier: ${IDENTIFIER}
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: ${MANIFEST_VERSION}
`;

const installerManifest = `${header('installer')}
PackageIdentifier: ${IDENTIFIER}
PackageVersion: ${version}
InstallerLocale: en-US
Platform:
- Windows.Desktop
MinimumOSVersion: 10.0.17763.0
InstallerType: nullsoft
Scope: user
InstallModes:
- interactive
- silent
- silentWithProgress
UpgradeBehavior: install
InstallerSwitches:
  Silent: /S
  SilentWithProgress: /S
ProductCode: ${PRODUCT_CODE}
Installers:
- Architecture: x64
  InstallerUrl: ${installerUrl}
  InstallerSha256: ${sha256}
ReleaseDate: ${date}
ManifestType: installer
ManifestVersion: ${MANIFEST_VERSION}
`;

const locale = (code, shortDescription, description, type) => `${header(type)}
PackageIdentifier: ${IDENTIFIER}
PackageVersion: ${version}
PackageLocale: ${code}
Publisher: ${PUBLISHER}
PublisherUrl: ${REPO}
PublisherSupportUrl: ${REPO}/issues
PrivacyUrl: ${REPO}/blob/main/PRIVACY.md
PackageName: ${PRODUCT}
PackageUrl: ${REPO}
License: MIT
LicenseUrl: ${REPO}/blob/main/LICENSE
Copyright: Copyright (c) 2026 ALDACO, Alexandre da Costa
ShortDescription: ${scalar(shortDescription)}
Description: |
${description
  .trim()
  .split('\n')
  .map((line) => (line ? `  ${line}` : ''))
  .join('\n')}
Tags:
- ai
- agents
- cli
- ollama
- terminal
- developer-tools
ReleaseNotesUrl: ${REPO}/releases/tag/${tag}
ManifestType: ${type}
ManifestVersion: ${MANIFEST_VERSION}
`;

const en = locale(
  'en-US',
  'Local manager for AI agents and models on Windows: a real console per agent, sessions side by side, no account and no telemetry.',
  `Hangar is a command post for working with several artificial intelligences at once, each in its own console on the same screen. The app starts with no predefined model or agent and hands over control before any conversation begins.

Hangar does not include AI agents, models or the Ollama runtime. You install those tools yourself from the official sources you register, under each vendor's licence and privacy policy. From the registered repositories (Ollama, Hugging Face, GitHub and OpenRouter) Hangar creates new installations as simply as it removes existing ones.

Everything runs on your machine: no account, no telemetry, no cost.`,
  'defaultLocale',
);

const pt = locale(
  'pt-PT',
  'Gestor local de agentes e modelos de IA para Windows: uma consola real por agente, sessões em paralelo, sem conta e sem telemetria.',
  `O Hangar é um posto de comando para trabalhar com várias inteligências artificiais ao mesmo tempo, cada uma na sua própria consola, no mesmo ecrã. A aplicação abre sem modelo nem agente predefinido e entrega o controlo antes de qualquer conversa começar.

O Hangar não inclui agentes, modelos de IA nem o runtime Ollama. Essas ferramentas são instaladas pelo utilizador, a partir das fontes oficiais que inscrever, e ficam sujeitas à licença e à política de privacidade de cada fornecedor. A partir dos repositórios inscritos (Ollama, Hugging Face, GitHub e OpenRouter) o Hangar gera novas instalações com a mesma simplicidade com que remove as que já existem.

Tudo corre na máquina do utilizador: sem conta, sem telemetria e sem custo.`,
  'locale',
);

const files = {
  [`${IDENTIFIER}.yaml`]: versionManifest,
  [`${IDENTIFIER}.installer.yaml`]: installerManifest,
  [`${IDENTIFIER}.locale.en-US.yaml`]: en,
  [`${IDENTIFIER}.locale.pt-PT.yaml`]: pt,
};

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), content);
  console.log(`  ${path.relative(root, path.join(outDir, name))}`);
}

console.log(`\nVersao:    ${version}`);
console.log(`Instalador: ${path.relative(root, setup)} (${fs.statSync(setup).size} bytes)`);
console.log(`SHA-256:   ${sha256}`);
console.log(`URL:       ${installerUrl}`);
