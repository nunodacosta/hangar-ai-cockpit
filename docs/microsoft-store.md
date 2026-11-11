# Publicação na Microsoft Store

Pacote MSIX/APPX do **Hangar — AI Cockpit** para submissão no Partner Center.

## Estado atual

| Item | Caminho | Estado |
| --- | --- | --- |
| Pacote | `dist/Hangar_1.1.1.0_x64.appx` | gerado, 162,1 MB, verificado com `makeappx unpack` |
| Manifesto | `build/appx/AppxManifest.xml` | válido, identidade por preencher |
| Assets | `build/appx/Assets/` | StoreLogo 50, Square44 44, Square150 150, Wide310x150, Splash 620x300 |
| Script | `tools/build-appx.js` (`npm run appx`) | gera o pacote a partir de `dist/win-unpacked` |

O pacote desempacota sem erros e contém o executável, `resources/app.asar`,
`node-pty` desempacotado, os cinco assets e o `AppxManifest.xml`.

## O que só o titular da conta pode fazer

1. **Conta de programador** em <https://partner.microsoft.com/dashboard>.
   Registo individual tem custo único (aprox. 19 USD); o registo de empresa exige
   verificação de domínio e de identidade legal.
2. **Reservar o nome** do produto: `Hangar - AI Cockpit`.
3. **Copiar a identidade** atribuída em *Gestor de produtos → Identidade do produto*
   para o manifesto:
   - `Package/Identity/Name` → atributo `Name` de `<Identity>`
   - `Package/Identity/Publisher` → atributo `Publisher` de `<Identity>`
   O valor de `Publisher` tem de coincidir exatamente com o certificado com que a
   Microsoft assina o pacote; se não coincidir, a submissão é rejeitada.
4. **Submeter** o `.appx`, preencher a listagem e enviar para certificação.

Sem estes quatro passos nenhuma submissão é possível: o Partner Center exige
autenticação da conta e a certificação é feita por revisores da Microsoft.

## Sequência de submissão

1. `npm run dist` — gera `dist/win-unpacked` com a versão atual.
2. `npm run appx` — gera `dist/Hangar_<versao>_x64.appx`.
3. Partner Center → *Novos produtos → Aplicação Windows* → reservar nome.
4. *Identidade do produto* → copiar `Name` e `Publisher` para
   `build/appx/AppxManifest.xml` e repetir o passo 2.
5. *Pacotes* → carregar o `.appx`. O Partner Center valida o manifesto e a
   identidade antes de aceitar o ficheiro.
6. *Listagem da loja*:
   - Descrição (ver `README.md`), funcionalidades e categoria
     (*Desenvolvimento de software* ou *Ferramentas de TI*).
   - Capturas de ecrã: mínimo 1, recomendado 4 a 6, em 1366x768 ou superior.
     As imagens de `docs/screenshots/` servem de base.
   - Logótipo da loja: `build/appx/Assets/StoreLogo.png` (50x50) e
     `Square150x150Logo.png` para a ficha do produto.
   - Requisitos de sistema: Windows 10 1809 (build 17763) ou superior, x64.
   - Contacto de suporte e política de privacidade (URL pública; a aplicação não
     recolhe telemetria, o que deve ser declarado).
7. *Classificação etária* — questionário IARC.
8. *Preços e disponibilidade* — gratuito, mercados pretendidos.
9. *Enviar para certificação*. O prazo típico é de 1 a 3 dias úteis.

## Teste local antes de submeter

O pacote gerado não está assinado. Para o instalar nesta máquina é preciso um
certificado de confiança local:

```powershell
$cert = New-SelfSignedCertificate -Type Custom -Subject "CN=ALDACO" `
  -KeyUsage DigitalSignature -FriendlyName "Hangar dev" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
Export-PfxCertificate -Cert $cert -FilePath hangar-dev.pfx -Password (Read-Host -AsSecureString)
```

Assinar e instalar:

```powershell
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22000.0\x64\signtool.exe" sign `
  /fd SHA256 /a /f hangar-dev.pfx dist\Hangar_1.0.0.0_x64.appx
Import-Certificate -FilePath hangar-dev.cer -CertStoreLocation Cert:\CurrentUser\TrustedPeople
Add-AppxPackage -Path dist\Hangar_1.0.0.0_x64.appx
```

O certificado de teste serve apenas para instalação local. Na loja, o pacote é
assinado pela Microsoft.

## Notas técnicas

- **Confiança total**: a aplicação declara `rescap:Capability runFullTrust` e
  `EntryPoint="Windows.FullTrustApplication"`, obrigatório para Electron com
  `node-pty`.
- **Pasta de dados**: em MSIX a pasta de instalação (`WindowsApps`) é só de
  leitura. `pickDataDir()` em `main.js` deteta isso e passa a usar
  `%APPDATA%\Hangar\data`, pelo que definições, catálogo cifrado e registos
  continuam a funcionar.
- **Versão**: o manifesto exige quatro componentes. `tools/build-appx.js`
  converte `1.1.1` em `1.1.1.0`; cada submissão tem de aumentar a versão.
- **Limite de tamanho**: 25 GB por pacote. O atual tem 162,1 MB.
- **Instalação de terceiros**: a aplicação instala Ollama e CLIs apenas após
  confirmação explícita do utilizador. A política 10.1.x da loja exige que
  qualquer instalação de software seja iniciada e divulgada pelo utilizador, o
  que o fluxo atual já cumpre.
- **Atualizações**: o pacote não inclui o mecanismo de atualização do
  `electron-builder` (`app-update.yml` é inerte em MSIX). As atualizações passam
  a ser entregues pela própria loja.
