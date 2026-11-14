# Política de privacidade — Hangar AI Cockpit

**Última atualização:** 13 de novembro de 2026
**Responsável:** ALDACO — Alexandre da Costa (programador individual)
**Contacto:** <https://github.com/nunodacosta/hangar-ai-cockpit/issues>
**Versão da aplicação:** 1.1.2

## Resumo

O Hangar é uma aplicação de ambiente de trabalho que corre inteiramente na máquina
do utilizador. Não há conta, registo, telemetria, análise de utilização, publicidade
nem servidores da ALDACO. Os dados necessários ao funcionamento ficam no disco
local. As únicas comunicações de rede são as que o utilizador inicia ou que a
vigilância de fontes que ele configurou desencadeia.

## 1. Que dados são tratados

O Hangar acede, sempre localmente, a:

- **Configurações da aplicação** — fontes inscritas, preferências de consola e
  limites da janela (`data/settings.json`).
- **Inventário do equipamento** — processador, memória, GPU, discos e sistema
  operativo, usado para ordenar modelos face à máquina
  (`data/host.enc`).
- **Catálogo e histórico de pesquisa** — agentes, modelos, resultados e
  pesquisas por tema (`data/cli.enc`, `data/search.enc`).
- **Registos técnicos** — mensagens de arranque, instalação e erros
  (`data/logs/`). Podem conter caminhos locais e saída de comandos.
- **Ficheiros e imagens escolhidos pelo utilizador** — lidos apenas quando o
  utilizador os anexa a uma conversa ou a um diretório de contexto.
- **Texto das conversas** — mantido em memória durante a sessão; não é gravado
  pela aplicação.

Os catálogos são cifrados no disco com uma chave protegida pelo
`safeStorage` do Electron (DPAPI no Windows). Os registos técnicos não são
cifrados.

Em MSIX/Store os dados ficam em `%APPDATA%\Hangar\data`. Na versão portátil ou
a partir do código ficam na pasta `data/` ao lado do executável (ou do projeto).

## 2. Para onde podem sair dados

Nenhum dado é enviado para a ALDACO. Consoante as ações do utilizador, podem
ocorrer pedidos para:

- **Ollama local** (`127.0.0.1:11434`) — quando o utilizador conversa com um
  modelo local; o pedido não sai da máquina.
- **Fontes de catálogo e novidades** — os endereços públicos que o utilizador
  inscreveu, incluindo Ollama Library, Hugging Face Hub, OpenRouter, ModelScope,
  Kaggle, Papers with Code, GitHub, GitLab, Replicate e Civitai. A aplicação
  consulta feeds RSS/Atom a cada dez minutos e o catálogo quando o utilizador o
  atualiza.
- **Agentes e modelos externos** — quando o utilizador abre uma sessão de chat,
  o texto, os anexos e o contexto escolhido são entregues ao CLI ou serviço que
  ele próprio instalou ou configurou. Esses serviços podem estar sujeitos a
  autenticação, quotas e políticas próprias.

O Hangar não intermedeia, não copia e não armazena essas comunicações nos seus
servidores (não existem servidores próprios). O tratamento feito por terceiros
rege-se pelas políticas desses terceiros.

## 3. Inteligência artificial

O Hangar é um gestor e uma consola para agentes e modelos de IA. Não gera
conteúdo próprio nem treina modelos. As respostas são produzidas pelos modelos
que o utilizador instalar ou configurar, local ou remotamente, e podem ser
imprecisas ou inadequadas. O utilizador escolhe os modelos, os prompts e as
fontes; a ALDACO não controla nem revê esse conteúdo.

Conteúdo impróprio gerado por um modelo pode ser reportado em
<https://github.com/nunodacosta/hangar-ai-cockpit/issues> (ou pelo atalho
*Denunciar conteúdo* na ajuda da aplicação). As denúncias são analisadas e, quando
aplicável, a fonte é removida do catálogo.

## 4. Instalação de software de terceiros

O Hangar não inclui agentes, modelos nem o runtime Ollama. Pode instalar e
remover software de terceiros a pedido explícito do utilizador, a partir das
fontes oficiais por ele inscritas (por exemplo npm, pip, GitHub ou o script de
instalação do Ollama). Nenhuma instalação é iniciada em segundo plano: o
utilizador vê a ação e confirma-a. O software instalado fica sujeito à licença e
à política de privacidade do respetivo fornecedor.

## 5. Partilha e venda

Não há venda, aluguer, partilha ou divulgação de dados a anunciantes,
corretores de dados ou terceiros. Não há rastreamento entre aplicações nem
identificadores de publicidade.

## 6. Segurança e conservação

Os dados ficam no perfil do utilizador e são protegidos pelas permissões do
Windows. A chave do catálogo é guardada com a proteção do sistema
(`safeStorage`/DPAPI). Os dados são conservados enquanto a aplicação estiver
instalada; não há expiração automática. Como não existe conta, não existe
serviço remoto de onde apagar dados.

## 7. Controlo e eliminação

O utilizador pode, a qualquer momento:

- apagar pesquisas e o catálogo local removendo `data/cli.enc`,
  `data/search.enc` e `data/host.enc`;
- apagar os registos removendo `data/logs/`;
- apagar todos os dados desinstalando a aplicação e removendo
  `%APPDATA%\Hangar` (MSIX) ou a pasta `data/` (portátil);
- remover fontes, agentes e modelos pela própria interface.

## 8. Crianças

O Hangar não se destina a crianças menores de 13 anos e não recolhe
conscientemente dados de crianças.

## 9. Alterações

Esta política é atualizada quando a aplicação passa a tratar novos dados ou a
comunicar com novos serviços. A data no topo identifica a versão em vigor.

## 10. Contacto

Dúvidas, pedidos de acesso ou denúncias:
<https://github.com/nunodacosta/hangar-ai-cockpit/issues>

---

# Privacy policy — Hangar AI Cockpit

**Last updated:** 13 November 2026
**Controller:** ALDACO — Alexandre da Costa (individual developer)
**Contact:** <https://github.com/nunodacosta/hangar-ai-cockpit/issues>

## Summary

Hangar is a desktop application that runs entirely on the user's machine. There
is no account, registration, telemetry, usage analytics, advertising or ALDACO
server. The data required to operate stays on local disk. Network requests only
happen when the user initiates them or when the source monitoring the user
configured runs.

## Data processed

Hangar accesses locally: application settings and registered sources; hardware
inventory (CPU, memory, GPU, disks, OS); catalog and search history; technical
logs that may contain local paths and command output; files and images the user
explicitly attaches; and conversation text, which is kept in memory for the
session and is not stored by the application.

Catalogs are encrypted at rest with a key protected by Electron `safeStorage`
(DPAPI on Windows). Technical logs are not encrypted. Under MSIX/Store the data
lives in `%APPDATA%\Hangar\data`; in the portable build or from source it lives
in the `data/` folder next to the executable or project.

## Network destinations

No data is sent to ALDACO. Depending on user actions, requests may go to: local
Ollama (`127.0.0.1:11434`); the public catalog and feed sources the user
registered (Ollama Library, Hugging Face Hub, OpenRouter, ModelScope, Kaggle,
Papers with Code, GitHub, GitLab, Replicate, Civitai), with RSS/Atom feeds polled
every ten minutes; and any third-party agent or model the user installed or
configured, which receives the prompt, attachments and context chosen by the
user and applies its own terms and privacy policy.

## Generative AI

Hangar is a manager and console for AI agents and models. It does not generate
content itself and does not train models. Output is produced by the models the
user installs or configures, locally or remotely, and may be inaccurate or
inappropriate. Users choose the models, prompts and sources. Inappropriate
output can be reported at
<https://github.com/nunodacosta/hangar-ai-cockpit/issues> (or through the
*Report content* shortcut in the in-app help); reports are reviewed and, where
applicable, the source is removed from the catalog.

## Third-party software

Hangar does not bundle agents, models or the Ollama runtime. It can install and
remove third-party software only after an explicit user action and confirmation,
using the official sources the user registered (for example npm, pip, GitHub or
Ollama's install script). Installed software is governed by its vendor's licence
and privacy policy.

## Sharing, retention and control

No data is sold, rented or shared with advertisers or data brokers. There is no
cross-app tracking or advertising identifier. Data stays in the user profile and
is protected by Windows permissions; it is retained while the application is
installed. Users can delete catalogs, logs and all local data as described
above, or uninstall the app and remove `%APPDATA%\Hangar` (MSIX) or `data/`
(portable). Hangar is not directed at children under 13. This policy is updated
whenever new data or services are introduced.
