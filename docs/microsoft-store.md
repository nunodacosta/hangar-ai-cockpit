# Publicação na Microsoft Store

Pacote MSIX/APPX do **Hangar AI Cockpit** para submissão no Partner Center.

## Estado atual

| Item | Caminho | Estado |
| --- | --- | --- |
| Pacote | `dist/Hangar_1.1.2.0_x64.appx` | gerado por `npm run store`; SHA-256 em `dist/Hangar_1.1.2.0_x64.appx.sha256` |
| Manifesto | `build/appx/AppxManifest.xml` | válido, identidade confirmada no Partner Center (2026-11-13), `runFullTrust` |
| Assets | `build/appx/Assets/` | 45 ficheiros: imagens base + variantes `scale-*` e `targetsize-*`, todos do Hangar |
| Ícone da ficha | `docs/store/store-logo-300.png` | 300x300, para carregar no Partner Center |
| Script | `tools/build-appx.js` (`npm run appx`) | valida versão, assets, identidade e empacota |
| Assets | `tools/gen-appx-assets.py` (`npm run assets:appx`) | regenera ícones e escalas a partir de `public/icon-512.png` |

O pacote desempacota sem erros e contém o executável, `resources/app.asar`,
`node-pty` desempacotado, os assets e o `AppxManifest.xml`.

## Construir o pacote

```powershell
npm ci                       # primeira vez
npm run store                # dist/win-unpacked + appx (recomendado)
```

Equivalente em duas etapas:

```powershell
npm run dist:dir             # só win-unpacked, sem instalador NSIS/portátil
npm run appx                 # empacota dist/win-unpacked
```

`npm run appx` recusa empacotar se `dist/win-unpacked` for mais antigo do que
`main.js`, `preload.js`, `server.js`, `public/**`, `package.json` ou o ícone.
Para forçar: `$env:MSIX_ALLOW_STALE = "1"`.

O script:

- converte `1.1.2` em `1.1.2.0` e exige que o quarto componente seja `0`;
- aplica `MSIX_NAME`/`MSIX_PUBLISHER` sem alterar o manifesto fonte;
- recusa um `Publisher` que não comece por `CN=`, um nome inválido ou o GUID de
  exemplo;
- confirma que os cinco assets base e o executável declarado existem;
- grava o SHA-256 ao lado do pacote.

## O que só o titular da conta pode fazer

1. **Conta de programador** em <https://partner.microsoft.com/dashboard>.
   Registo individual tem custo único (aprox. 19 USD); o registo de empresa exige
   verificação de domínio e de identidade legal.
2. **Nome do produto**: já está reservado como `Hangar AI Cockpit` (a primeira
   reserva é a que dá nome ao produto no Partner Center e é a que aparece na
   loja). O `DisplayName` do manifesto, o executável e a interface usam o mesmo
   nome, para que loja, menu Iniciar e barra de tarefas coincidam. Não é preciso
   reservar outro nome.

   O `Name` da identidade e o `Package Family Name` **não mudam** com o nome
   visível: são atribuídos na primeira reserva. Se mais tarde quiser mudar o nome,
   reserve-o em *Manage app names* e escolha-o no campo **Product name** da ficha
   de cada idioma — a identidade do pacote continua válida.

3. **Identidade confirmada** em *Product identity* (já aplicada ao manifesto,
   sem necessidade de `MSIX_NAME`/`MSIX_PUBLISHER`):

   | Campo | Valor |
   | --- | --- |
   | `Package/Identity/Name` | `AlexandredaCosta.HangarAICockpit` |
   | `Package/Identity/Publisher` | `CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3` |
   | `Package/Properties/PublisherDisplayName` | `Alexandre da Costa` |
   | Package Family Name (PFN) | `AlexandredaCosta.HangarAICockpit_5pzgnwhnkfja8` |
   | Package SID | `S-1-15-2-2150098448-2872863468-2623060691-593751662-3866218612-2803416193-1347459142` |
   | Store ID | `9PNQQJB7S4ZV` |
   | URL da loja | <https://apps.microsoft.com/detail/9PNQQJB7S4ZV> |
   | Link de protocolo | `ms-windows-store://pdp/?productid=9PNQQJB7S4ZV` |
   | ID da aplicação MSA | `1a08e980-f8af-4578-8cb5-528b934c2120` |

   O `Publisher` tem de coincidir exatamente com o certificado com que a
   Microsoft assina o pacote; se não coincidir, a submissão é rejeitada. O
   `tools/build-appx.js` valida os dois valores por omissão; para usar outros:

   ```powershell
   $env:MSIX_NAME = "<Package/Identity/Name do Partner Center>"
   $env:MSIX_PUBLISHER = "<Package/Identity/Publisher do Partner Center>"
   npm run store
   ```

   A app não usa a aplicação MSA (não há início de sessão nem conta), por isso o
   ID acima não entra no manifesto.

4. **Submeter** o `.appx`, preencher a listagem e enviar para certificação.

Sem estes quatro passos nenhuma submissão é possível: o Partner Center exige
autenticação da conta e a certificação é feita por revisores da Microsoft.

## Sequência de submissão

1. `npm run store` — gera `dist/Hangar_1.1.2.0_x64.appx`.
2. Partner Center → produto existente (`9PNQQJB7S4ZV`, nome `Hangar AI Cockpit`)
   → *Product identity*: nada a alterar.
3. *Product identity* → confirmar `Name` (`AlexandredaCosta.HangarAICockpit`) e
   `Publisher` (`CN=A9DA431F-...`) e repetir o passo 1 se forem diferentes.
4. *Pacotes* → carregar o `.appx`. O Partner Center valida o manifesto e a
   identidade. Formatos aceites: `.appx`, `.appxbundle`, `.msix`, `.msixbundle`
   e os respetivos `.appxupload`/`.msixupload`; o `.appx` não precisa de
   assinatura, porque a Store assina.
5. *Listagem da loja* — copiar de `docs/loja-ficha.md`:
   - **Product name**: `Hangar AI Cockpit` (já é o nome da reserva);
   - descrição, funcionalidades e categoria;
   - capturas de `docs/screenshots/` (1920x1020, acima do mínimo 1366x768);
   - logótipo 300x300 `docs/store/store-logo-300.png`;
   - idiomas da ficha: `pt-PT` e `en-US`.
6. *Propriedades*:
   - categoria *Desenvolvimento de software → Ferramentas de programação*;
   - **URL da política de privacidade**:
     `https://github.com/nunodacosta/hangar-ai-cockpit/blob/main/PRIVACY.md`;
   - website/suporte: `https://github.com/nunodacosta/hangar-ai-cockpit/issues`;
   - requisitos: Windows 10 1809 (build 17763) ou superior, x64.
7. *Classificação etária* — questionário IARC. A aplicação conversa com modelos
   de IA e apresenta conteúdo gerado dinamicamente; responder com sinceridade
   (provavelmente 12+).
8. *Preços e disponibilidade* — gratuito, sem período de teste, sem compras
   dentro da aplicação, todos os mercados elegíveis.
9. *Opções de submissão* — colar a justificação de `runFullTrust` e as notas de
   certificação abaixo; declarar a utilização de IA generativa.
10. **Enviar para certificação**. O prazo típico é de 1 a 3 dias úteis.

## Declarações obrigatórias

### Capacidade restrita `runFullTrust`

A aplicação declara `rescap:Capability Name="runFullTrust"` com
`EntryPoint="Windows.FullTrustApplication"`. Texto para a caixa de justificação
do Partner Center:

> Hangar is an Electron desktop application that manages AI command-line tools
> installed on the user's own PC and hosts a real terminal session. Full trust is
> required to spawn the locally installed CLIs and the user's PowerShell through
> node-pty, to read and write the folders the user explicitly selects, to
> install/uninstall those tools with the system package managers after an
> explicit confirmation, and to show native file dialogs. The AppContainer model
> cannot run an interactive terminal or execute arbitrary user-installed CLIs.
> The app does not use full trust to change Windows settings, install services
> or drivers, or run anything without the user's action.

### IA generativa

O Hangar é um gestor e uma consola para modelos de IA. As respostas são geradas
pelos modelos que o utilizador instala ou configura. Na submissão:

- marcar a declaração de **IA generativa / conteúdo gerado por IA**, quando
  apresentada;
- garantir que a descrição da loja refere a utilização de IA e que o software de
  terceiros não está incluído (`docs/loja-ficha.md`);
- a aplicação já inclui, na ajuda, uma ligação **Denunciar conteúdo** para
  <https://github.com/nunodacosta/hangar-ai-cockpit/issues>, cumprindo o requisito
  de meio de denúncia da política 11.16.

### Dependência de software não incluído

A política 10.2.4 exige que a dependência seja divulgada no início da descrição.
A ficha começa por dizer que o Hangar não inclui agentes nem modelos e que estes
são instalados pelo utilizador a partir das fontes oficiais.

### Privacidade

Produtos Win32/Desktop Bridge têm de ter política de privacidade (política 10.5).
`PRIVACY.md` está na raiz do repositório público e é a URL indicada no Partner
Center. O ficheiro descreve dados locais, pedidos de rede, IA, software de
terceiros, conservação e eliminação.

## Notas para certificação (copiar)

> **O que testar primeiro**
>
> 1. Abra a aplicação. Não é necessário modelo, agente nem conta: o ecrã inicial
>    mostra o equipamento e o catálogo.
> 2. Abra a ajuda da aplicação (ícone no topo). As secções 7 e 8 têm as licenças,
>    a política de privacidade e a ligação para denunciar conteúdo.
> 3. Assinale um agente ou modelo já instalado para abrir uma consola; o Hangar
>    usa PowerShell e node-pty para uma sessão real.
> 4. A instalação de um agente/modelo e a do Ollama só começam depois de um
>    clique explícito e de uma confirmação. Nada é descarregado nem instalado em
>    segundo plano. O comando e a origem são mostrados ao utilizador.
> 5. A remoção de CLIs pede confirmação e usa npm/pip; a remoção de modelos usa o
>    próprio Ollama.
>
> **O que a aplicação não faz**
>
> - Não pede conta, credenciais, cartão ou dados financeiros.
> - Não recolhe telemetria, análise de utilização nem identificadores de
>   publicidade.
> - Não contacta servidores da ALDACO (não existem).
> - Não instala serviços, drivers nem tarefas de arranque.
> - Não altera definições do Windows.
>
> **Rede**
>
> Os pedidos de rede são para as fontes públicas que o utilizador inscreveu
> (Ollama, Hugging Face, GitHub, OpenRouter, entre outras), para o Ollama local
> em `127.0.0.1:11434` e para os CLIs/serviços que o utilizador configurar. Os
> feeds RSS/Atom são consultados a cada dez minutos. Isto está descrito na
> política de privacidade.
>
> **Dados**
>
> Em MSIX os dados ficam em `%APPDATA%\Hangar\data` (a pasta de instalação é só
> de leitura). A desinstalação remove a aplicação; os dados do utilizador podem
> ser apagados removendo essa pasta.
>
> **Sem conta de demonstração** — não é necessária qualquer autenticação.

## Teste local antes de submeter

O pacote final não está assinado: é a Microsoft que assina na publicação. Um
pacote não assinado **não pode** ser instalado, nem com `-AllowUnsigned`, porque
contém uma ativação `Executable` (é o caso de qualquer app desktop bridge). Os
erros observados nesta máquina foram:

| Tentativa | Resultado |
| --- | --- |
| `Add-AppxPackage -Path ...appx -AllowUnsigned` | `0x80073D2C` — o publisher não pertence ao espaço de nomes reservado a pacotes não assinados |
| o mesmo com o marcador `OID.2.25.311729368913984317654407730594956997722=1` no Publisher | `0x80073D2B` — *"an unsigned package cannot include Executable activations"* |

Há duas formas válidas de testar.

### 1. Registo solto (rápido, com Modo de Programador)

Usa a pasta que o `npm run store` deixa em `dist\appx-layout`. Não gera `.appx`,
mas corre o código e o manifesto reais, incluindo a identidade do pacote:

```powershell
Add-AppxPackage -Register "$PWD\dist\appx-layout\AppxManifest.xml"
Start-Process "shell:AppsFolder\AlexandredaCosta.HangarAICockpit_5pzgnwhnkfja8!Hangar"
Get-AppxPackage AlexandredaCosta.HangarAICockpit | Remove-AppxPackage
```

O manifesto tem de estar na raiz do pacote — registar um caminho fora dessa raiz
dá `0x80073CF9`. Como a pasta de instalação é gravável, os dados ficam em
`dist\appx-layout\data`; apagar essa pasta depois do teste.

### 2. Pacote assinado (testa o artefacto final)

Para instalar o `.appx` tal como é validado pela Store, é preciso assiná-lo com
um certificado cujo *subject* seja **exatamente** o `Publisher` do manifesto:

```powershell
# 1. certificado de teste (subject = Publisher do AppxManifest.xml)
$pwd = ConvertTo-SecureString "HangarTest!2026" -AsPlainText -Force
$cert = New-SelfSignedCertificate -Type Custom `
  -Subject "CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3" `
  -KeyUsage DigitalSignature -FriendlyName "Hangar local test" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
Export-PfxCertificate -Cert $cert -FilePath "$env:TEMP\hangar-test.pfx" -Password $pwd
Export-Certificate -Cert $cert -FilePath "$env:TEMP\hangar-test.cer"

# 2. assinar uma cópia (nunca o artefacto que vai para a Store)
Copy-Item dist\Hangar_1.1.2.0_x64.appx "$env:TEMP\Hangar-test.appx"
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22000.0\x64\signtool.exe" sign `
  /fd SHA256 /f "$env:TEMP\hangar-test.pfx" /p "HangarTest!2026" `
  /tr http://timestamp.digicert.com /td SHA256 "$env:TEMP\Hangar-test.appx"

# 3. confiar no certificado. A validação de assinatura de pacotes usa a loja da
#    máquina, não a do utilizador: CurrentUser\TrustedPeople não chega (0x800B0109).
#    Estes dois comandos precisam de consola elevada (UAC).
certutil -addstore Root "$env:TEMP\hangar-test.cer"
certutil -addstore TrustedPeople "$env:TEMP\hangar-test.cer"

# 4. instalar e abrir
Add-AppxPackage -Path "$env:TEMP\Hangar-test.appx"
Start-Process "shell:AppsFolder\AlexandredaCosta.HangarAICockpit_5pzgnwhnkfja8!Hangar"
Get-AppxPackage AlexandredaCosta.HangarAICockpit | Remove-AppxPackage

# 5. limpar certificado e ficheiros de teste (elevado)
certutil -delstore Root "09B10BF71B280F9EB3E6718ED57F00D2122D615D"
certutil -delstore TrustedPeople "09B10BF71B280F9EB3E6718ED57F00D2122D615D"
Get-ChildItem Cert:\CurrentUser\My |
  Where-Object { $_.Subject -eq "CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3" } | Remove-Item
Remove-Item "$env:TEMP\Hangar-test.appx","$env:TEMP\hangar-test.pfx","$env:TEMP\hangar-test.cer" -Force
```

Resultado esperado: `SignatureKind = Developer`, instalação em
`C:\Program Files\WindowsApps`, título da janela `Hangar AI Cockpit` e dados em
`%APPDATA%\Hangar\data` (fisicamente em
`%LOCALAPPDATA%\Packages\AlexandredaCosta.HangarAICockpit_5pzgnwhnkfja8\LocalCache\Roaming\Hangar\data`,
por virtualização do MSIX).

O certificado de teste serve apenas para instalação local. Na loja, o pacote é
assinado pela Microsoft. **Não** incluir `.pfx`/`.cer` no repositório nem no
pacote.

### O ícone antigo continua a aparecer

O Windows guarda os ícones das aplicações empacotadas em cache, por família de
pacotes, e uma reinstalação da mesma versão pode reutilizar o ícone anterior.
Para forçar a atualização:

```powershell
# 1. remover todas as versões instaladas
Get-AppxPackage AlexandredaCosta.HangarAICockpit | Remove-AppxPackage

# 2. tirar a app da barra de tarefas (clique direito → Desafixar) e voltar a
#    fixá-la depois de instalar a versão nova

# 3. limpar a cache de ícones e reiniciar o Explorador
ie4uinit.exe -show
Stop-Process -Name explorer -Force   # o Windows reinicia o Explorador
```

Se, mesmo assim, o mosaico do menu Iniciar mantiver o ícone antigo, gerar o
pacote com uma versão superior (`package.json` → `version`) para que o Windows o
trate como atualização.

### Windows App Certification Kit

Recomendado pela Microsoft antes de submeter:

```powershell
& "C:\Program Files (x86)\Windows Kits\10\App Certification Kit\appcert.exe" test `
  -appxpackagepath dist\Hangar_1.1.2.0_x64.appx `
  -reportpath dist\wack-report.xml -overwrite
```

Nesta máquina o WACK não arranca: falta a assemblagem
`Microsoft.Windows.Build.Appx.AppxPackaging.dll` na instalação do Windows SDK
(erro de configuração lado-a-lado). Reparar/instalar o **Windows SDK** pelo
Visual Studio Installer e repetir. Alternativa: executar `appcertui.exe` numa
máquina limpa com o SDK completo.

## Notas técnicas

- **Confiança total**: `rescap:Capability runFullTrust` e
  `EntryPoint="Windows.FullTrustApplication"`, obrigatório para Electron com
  `node-pty`.
- **Pasta de dados**: em MSIX a pasta de instalação (`WindowsApps`) é só de
  leitura. `pickDataDir()` em `main.js` deteta isso e usa
  `%APPDATA%\Hangar\data` (cria `Hangar` quando não existe nenhuma pasta antiga e
  migra `AI CLI Manager` quando existe). Os registos de erro também passam a ser
  escritos aí. O MSIX redireciona fisicamente `%APPDATA%` para
  `%LOCALAPPDATA%\Packages\<PackageFamilyName>\LocalCache\Roaming`, por isso a
  desinstalação e a limpeza de dados têm de olhar para esse caminho.
- **Identidade da aplicação**: em MSIX o AUMID vem do pacote; `main.js` só define
  `com.aldaco.hangar` fora do pacote, para não quebrar notificações e a fixação
  na barra de tarefas.
- **Assets**: todos os logos do pacote (quadrados, mosaico largo, splash e o
  300x300 da ficha) vêm de `public/icon-512.png`, o ícone do produto gerado por
  `tools/gen_icon.py`. `tools/gen-appx-assets.py` (`npm run assets:appx`)
  regenera as variantes `scale-125/150/200/400` e `targetsize-*` a partir dessa
  fonte; o mosaico largo e o splash são compostos sobre `#111C30`. Os ficheiros
  `build/aldaco/` são o ícone institucional da ALDACO e **não** entram no pacote.
  O ícone da ficha (300x300) não vai no pacote: carrega-se no Partner Center.
- **Idioma do pacote**: apenas `pt-PT`, porque a interface está em português. A
  ficha da loja pode ter também `en-US`.
- **Versão**: o manifesto exige quatro componentes e o quarto tem de ser 0.
  Cada submissão tem de aumentar a versão; `package.json` é a fonte de verdade.
- **Limite de tamanho**: 25 GB por pacote. O atual tem cerca de 162 MB.
- **Instalação de terceiros**: a aplicação instala Ollama e CLIs apenas após
  confirmação explícita do utilizador (política 10.1.2/10.2.3 e 11.16).
- **Atualizações**: `app-update.yml` é inerte em MSIX; as atualizações são
  entregues pela Store.
- **Assinatura**: o `.appx` gerado não é assinado de propósito. A Store
  re-assina; para sideload é preciso um certificado próprio.
