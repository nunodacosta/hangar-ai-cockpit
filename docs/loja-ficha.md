# Ficha da loja — textos prontos a colar

Valores a copiar para o Partner Center, produto **Hangar AI Cockpit**.
Identidade já aplicada ao manifesto (commit `241b414`).

## Identidade

Valores confirmados em *Product identity* no Partner Center (2026-11-13) e já
aplicados ao manifesto.

| Campo | Valor |
| --- | --- |
| `Package/Identity/Name` | `AlexandredaCosta.HangarAICockpit` |
| `Package/Identity/Publisher` | `CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3` |
| `Package/Properties/PublisherDisplayName` | `Alexandre da Costa` |
| Package Family Name (PFN) | `AlexandredaCosta.HangarAICockpit_5pzgnwhnkfja8` |
| Store ID | `9PNQQJB7S4ZV` |
| URL da loja | <https://apps.microsoft.com/detail/9PNQQJB7S4ZV> |
| Versão do pacote | `1.1.2.0` |
| Pacote | `dist/Hangar_1.1.2.0_x64.appx` (162,7 MB) |
| Arquitetura | x64 |

O `Name` e o PFN são identificadores técnicos da primeira reserva e não mudam com
o nome visível. O nome do produto é `Hangar AI Cockpit` em todo o lado: reserva,
campo **Product name** da ficha, `DisplayName` do manifesto, executável e
interface.

## Nome e descrição

**Nome do produto:** Hangar AI Cockpit

**Descrição curta (pt-PT, 213 caracteres):**

> Gestor local de agentes e modelos de IA para Windows. Uma consola real por agente, várias sessões em paralelo no mesmo ecrã, instalação e remoção a partir dos repositórios que inscrever. Sem conta, sem telemetria.

**Descrição (pt-PT):**

> O Hangar não inclui agentes, modelos de IA nem o runtime Ollama. Essas
> ferramentas são instaladas pelo utilizador, a partir das fontes oficiais que
> inscrever, e ficam sujeitas à licença e à política de privacidade de cada
> fornecedor.
>
> O Hangar é um posto de comando para trabalhar com várias inteligências
> artificiais ao mesmo tempo, cada uma na sua própria consola, no mesmo ecrã.
>
> A aplicação abre sem modelo nem agente predefinido: valida o equipamento, o
> sistema e o catálogo, e entrega o controlo antes de qualquer conversa começar.
> Cada AI assinalada abre o seu separador e a sua própria sessão; alternar de
> separador muda a conversa e mantém o contexto das restantes.
>
> A partir dos repositórios inscritos — Ollama, Hugging Face, GitHub e OpenRouter
> — o Hangar gera novas instalações com a mesma simplicidade com que remove as que
> já existem. A pesquisa na web parte dessas fontes e a pesquisa de modelos aceita
> um tema escrito pelo utilizador, com resultados ordenados face ao equipamento.
>
> A cor é usada como aviso: quando a remoção está armada, as caixas e o ícone
> passam a vermelho. A consola permite ajustar a altura por arrastamento da aresta
> superior e redimensionar cada sessão.
>
> **Inteligência artificial:** o Hangar não gera conteúdo próprio nem treina
> modelos. As respostas são produzidas pelos modelos que o utilizador instalar ou
> configurar, local ou remotamente, e podem ser imprecisas ou inadequadas. O
> utilizador escolhe os modelos, os prompts e as fontes. Conteúdo impróprio pode
> ser denunciado em <https://github.com/nunodacosta/hangar-ai-cockpit/issues> ou
> pelo atalho *Denunciar conteúdo* na ajuda da aplicação.
>
> Tudo corre na máquina do utilizador. Não há conta, não há telemetria e não há
> custo. A política de privacidade está em
> <https://github.com/nunodacosta/hangar-ai-cockpit/blob/main/PRIVACY.md>.
>
> Conceito, design e interação: ALDACO — Alexandre da Costa. Código sob licença
> MIT.

**Short description (en-US, 188 caracteres):**

> Local manager for AI agents and models on Windows. A real console per agent, several sessions side by side, install and remove from the repositories you register. No account, no telemetry.

**Description (en-US, optional listing):**

> Hangar does not include AI agents, models or the Ollama runtime. You install
> those tools yourself from the official sources you register, under each
> vendor's licence and privacy policy.
>
> Hangar is a command post for working with several artificial intelligences at
> once, each in its own console on the same screen.
>
> The app starts with no predefined model or agent: it checks the machine, the
> system and the catalog, and hands over control before any conversation begins.
> Each selected AI opens its own tab and session; switching tabs changes the
> conversation and keeps the context of the others.
>
> From the registered repositories — Ollama, Hugging Face, GitHub and OpenRouter
> — Hangar creates new installations as simply as it removes existing ones. Web
> search starts from those sources, and model search accepts a topic written by
> the user, ranked against the hardware.
>
> Colour is used as a warning: when removal is armed, boxes and the icon turn
> red. The console height and each session can be resized by dragging.
>
> **Artificial intelligence:** Hangar does not generate content itself and does
> not train models. Output is produced by the models you install or configure,
> locally or remotely, and may be inaccurate or inappropriate. You choose the
> models, prompts and sources. Inappropriate content can be reported at
> <https://github.com/nunodacosta/hangar-ai-cockpit/issues> or through the
> *Report content* shortcut in the in-app help.
>
> Everything runs on your machine. No account, no telemetry, no cost. Privacy
> policy:
> <https://github.com/nunodacosta/hangar-ai-cockpit/blob/main/PRIVACY.md>.

## Categoria e requisitos

| Campo | Valor |
| --- | --- |
| Categoria | Desenvolvimento de software → Ferramentas de programação |
| Subcategoria alternativa | Ferramentas de TI → Administração de sistemas |
| Sistema mínimo | Windows 10 versão 1809 (build 17763), x64 |
| Arquitetura | x64 |
| Preço | Gratuito |
| Modelo de preço | Base price **Free**, sem períodos de teste, sem compras dentro da aplicação |
| Idioma do pacote | `pt-PT` (a interface está em português) |
| Idiomas da ficha | `pt-PT` e `en-US` |

## Funcionalidades a listar (máximo 20)

1. Uma consola real por agente, com sessões em paralelo
2. Arranque sem AI selecionada, com validação do equipamento
3. Instalação de agentes e modelos a partir dos repositórios inscritos
4. Remoção das CLI já instaladas, com confirmação
5. Pesquisa na web a partir das fontes configuradas
6. Pesquisa de modelos por tema escrito pelo utilizador
7. Ranking de modelos calculado face ao equipamento
8. Vigilância de instalações e novidades por RSS
9. Aviso por cor quando a remoção está armada
10. Consola redimensionável por arrastamento da aresta superior
11. Ajuda da aplicação com capturas e licenças
12. Política de privacidade e denúncia de conteúdo na ajuda
13. Sem conta, sem telemetria, sem custo

## Capturas (1920x1020, acima do mínimo 1366x768)

| Ficheiro | Conteúdo |
| --- | --- |
| `docs/screenshots/arranque.png` | Arranque sem AI selecionada |
| `docs/screenshots/pesquisa.png` | Consulta das fontes configuradas |
| `docs/screenshots/ajuda.png` | Ajuda da aplicação |
| `docs/screenshots/cartoes.png` | Painel esquerdo em cartões |
| `docs/screenshots/conversa.png` | Duas sessões em paralelo |
| `docs/screenshots/menu.png` | Menu flutuante de contexto |
| `docs/screenshots/perigo.png` | Aviso de remoção a vermelho |

## Assets do pacote

| Ficheiro | Dimensão | Uso |
| --- | --- | --- |
| `docs/store/store-logo-300.png` | 300x300 | Ícone da ficha (carregar no Partner Center) |
| `build/appx/Assets/StoreLogo.png` | 50x50 | Ficha da loja no pacote |
| `build/appx/Assets/Square44x44Logo.png` | 44x44 | Lista de aplicações |
| `build/appx/Assets/Square150x150Logo.png` | 150x150 | Mosaico |
| `build/appx/Assets/Wide310x150Logo.png` | 310x150 | Mosaico largo |
| `build/appx/Assets/SplashScreen.png` | 620x300 | Ecrã de arranque |

As variantes `*.scale-*` e `Square44x44Logo.targetsize-*` (incluindo
`altform-unplated` e `altform-lightunplated`) são geradas por
`npm run assets:appx` e vão no pacote; o manifesto referencia as imagens base.

## Declarações

**Dependência de software não incluído (política 10.2.4):** o Hangar não inclui
agentes, modelos de IA nem o runtime Ollama. São instalados pelo utilizador, após
confirmação explícita, a partir das fontes oficiais que inscrever. A descrição da
loja começa por esta declaração.

**Telemetria:** a aplicação não recolhe telemetria nem envia dados para servidores
próprios. As consultas de rede ocorrem apenas quando o utilizador as inicia ou
quando a vigilância das fontes que configurou corre, para os endereços que
inscreveu.

**Instalação de terceiros:** Ollama e as CLI são instalados apenas após
confirmação explícita do utilizador, em conformidade com a política 10.1.x. Nada
é descarregado nem instalado em segundo plano.

**IA generativa (política 11.16):** a aplicação é um gestor e uma consola para
modelos de IA. As respostas são geradas pelos modelos que o utilizador instala ou
configura. A descrição identifica esta utilização e a ajuda da aplicação inclui o
atalho **Denunciar conteúdo**, que abre o canal de denúncia.

**Privacidade (política 10.5):** não há conta nem perfil de utilizador. Os dados
ficam em `%APPDATA%\Hangar\data` (MSIX) ou em `data/` (portátil). Política
completa:
<https://github.com/nunodacosta/hangar-ai-cockpit/blob/main/PRIVACY.md>.

**Contacto de suporte:** o repositório público
<https://github.com/nunodacosta/hangar-ai-cockpit> serve de canal de suporte;
issues em <https://github.com/nunodacosta/hangar-ai-cockpit/issues>.

## Sequência de submissão

1. Partner Center → *Pacotes* → carregar `dist/Hangar_1.1.2.0_x64.appx`.
2. *Listagem da loja* → colar os textos acima, carregar as sete capturas e o
   ícone `docs/store/store-logo-300.png`; definir os idiomas `pt-PT` e `en-US`.
3. *Propriedades* → categoria, requisitos (Windows 10 1809, x64), URL da política
   de privacidade e URL de suporte indicadas acima.
4. *Classificação etária* → questionário IARC. A aplicação conversa com modelos
   de IA e apresenta conteúdo gerado dinamicamente; responder com sinceridade
   (provavelmente 12+).
5. *Preços e disponibilidade* → gratuito, mercados pretendidos.

   No Partner Center, em *Preços e disponibilidade*:
   - **Base price** → `Free`
   - **Free trial** → `No free trial`
   - **Purchases** → desativado (a aplicação não tem compras dentro da aplicação)
   - **Marcados** → todos os mercados onde o pacote é elegível

   A aplicação não tem custo, conta nem telemetria, pelo que não há motivo para
   preço nem para período de teste.
6. *Opções de submissão* → colar a justificação de `runFullTrust`, as notas de
   certificação e a declaração de IA generativa de `docs/microsoft-store.md`.
7. *Enviar para certificação* — prazo típico de 1 a 3 dias úteis.

Cada nova submissão tem de aumentar a versão: o manifesto exige quatro
componentes e `tools/build-appx.js` converte `1.1.2` em `1.1.2.0`. O quarto
componente tem de ser `0`.
