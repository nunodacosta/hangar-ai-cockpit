# Publicação no winget

Manifestos do **Hangar AI Cockpit** para o repositório comunitário
[`microsoft/winget-pkgs`](https://github.com/microsoft/winget-pkgs), que alimenta
o `winget install`.

PR aberto em 2026-11-15:
<https://github.com/microsoft/winget-pkgs/pull/480635>. As verificações
automáticas (01 a 10) e o acordo de licença de contribuidor estão concluídos com
sucesso; falta a aprovação de um moderador da comunidade.

## Identidade do pacote

| Campo | Valor |
| --- | --- |
| `PackageIdentifier` | `ALDACO.HangarAICockpit` |
| `Publisher` | `ALDACO` (igual ao `Publisher` do instalador NSIS) |
| `PackageName` | `Hangar AI Cockpit` |
| `PackageVersion` | `1.1.2` |
| Instalador | `Hangar_Setup.exe` (NSIS, por utilizador) |
| Arquitetura | x64 |

O identificador usa `ALDACO` porque é o publisher que o instalador regista em
*Aplicações instaladas*. O `Name` da Microsoft Store
(`AlexandredaCosta.HangarAICockpit`) é a identidade do pacote MSIX e não se
aplica aqui: são canais de distribuição diferentes.

O `.appx` **não** serve para o winget: vai sem assinatura e o winget não o
consegue instalar. O winget usa o instalador NSIS publicado nas releases.

## Ficheiros

Gerados em `winget/manifests/a/ALDACO/HangarAICockpit/1.1.2/`:

| Ficheiro | Conteúdo |
| --- | --- |
| `ALDACO.HangarAICockpit.yaml` | versão e idioma por omissão |
| `ALDACO.HangarAICockpit.installer.yaml` | URL, SHA-256, tipo `nullsoft`, `Scope: user`, `/S` |
| `ALDACO.HangarAICockpit.locale.en-US.yaml` | textos em inglês |
| `ALDACO.HangarAICockpit.locale.pt-PT.yaml` | textos em português |

O caminho segue a regra do `winget-pkgs`: primeira letra do identificador em
minúscula (`a`), publisher, pacote e versão.

Campos relevantes do instalador:

- `InstallerType: nullsoft` e `InstallerSwitches: Silent: /S`;
- `Scope: user` — instala em `%LOCALAPPDATA%\Programs`, sem UAC;
- `UpgradeBehavior: install` — atualiza por cima da versão anterior;
- `ProductCode: 0a5065f8-…` — GUID estável do desinstalador, derivado do
  `appId` (`com.aldaco.hangar`), igual em todas as versões.

## Gerar e validar

```powershell
npm run dist                                  # cria dist/Hangar_Setup.exe
npm run winget                                # manifestos da versão atual
npm run winget -- --date 2026-11-15           # data de release explícita
winget validate --manifest winget\manifests\a\ALDACO\HangarAICockpit\1.1.2
winget show --manifest winget\manifests\a\ALDACO\HangarAICockpit\1.1.2
```

O SHA-256 é calculado a partir do instalador, por isso gerar sempre depois de
`npm run dist`. Para confirmar que o ficheiro publicado é o mesmo, comparar com
o `digest` do GitHub:

```powershell
gh api repos/nunodacosta/hangar-ai-cockpit/releases/tags/v1.1.2 `
  --jq '.assets[] | "\(.name) \(.size) \(.digest)"'
```

Teste local completo (instala e depois remove a aplicação):

```powershell
# uma vez, numa consola elevada: o winget bloqueia manifestos locais por omissão
winget settings --enable LocalManifestFiles

winget install --manifest winget\manifests\a\ALDACO\HangarAICockpit\1.1.2 --silent
winget list Hangar
winget uninstall "Hangar AI Cockpit"
```

Sem essa definição, o `winget install` responde *"Este recurso precisa ser
habilitado pelos administradores"* e mostra a ajuda.

O `ProductCode` do manifesto é o GUID que o instalador regista em
*Aplicações instaladas*; `winget list Hangar` mostra a entrada como
`ARP\User\X64\0a5065f8-…`, o que confirma a correspondência usada nas
atualizações e remoções.

## Submissão

1. Fazer fork de `microsoft/winget-pkgs`.
2. Copiar a pasta
   `winget\manifests\a\ALDACO\HangarAICockpit\1.1.2` para
   `manifests/a/ALDACO/HangarAICockpit/1.1.2` no fork.
3. Commit e push num ramo novo.
4. Abrir um pull request contra `master` com o título
   `[New package] ALDACO.HangarAICockpit version 1.1.2`.
5. Assinar o CLA quando o bot pedir e aguardar as verificações
   `Validation-*` e a revisão de um moderador. O prazo típico é de alguns dias.

O URL do instalador é uma release do GitHub (estável e imutável), pelo que não
é preciso alojamento adicional. O SHA-256 e o URL no manifesto são verificados
pela pipeline do winget-pkgs.

## Atualizar para uma versão nova

1. Subir `version` em `package.json`.
2. `npm run dist` — reconstrói `Hangar_Setup.exe`.
3. `npm run winget` — cria a pasta da versão nova (as anteriores ficam).
4. `winget validate --manifest <pasta nova>`.
5. PR a acrescentar apenas a pasta da versão nova. Não apagar versões antigas.

## Notas para a revisão

- O instalador NSIS é por utilizador e aceita `/S`; foi testado localmente e
  regista `Publisher: ALDACO` e `DisplayName: Hangar AI Cockpit 1.1.2`.
- O Hangar não inclui agentes, modelos nem o runtime Ollama: instala ferramentas
  de terceiros apenas após confirmação do utilizador. A descrição di-lo de
  forma explícita.
- Sem conta, sem telemetria; a política de privacidade está ligada no manifesto
  (`PrivacyUrl`).
- Licença MIT (`LicenseUrl`), copyright de ALDACO / Alexandre da Costa.
- O ícone e o nome do produto são os do Hangar; o ícone institucional da ALDACO
  não é usado pela aplicação.
