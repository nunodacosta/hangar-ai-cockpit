# Ficha da loja — textos prontos a colar

Valores a copiar para o Partner Center, produto **Hangar - AI Cockpit**.
Identidade já aplicada ao manifesto (commit `241b414`).

## Identidade

| Campo | Valor |
| --- | --- |
| `Package/Identity/Name` | `AlexandredaCosta.HangarAICockpit` |
| `Package/Identity/Publisher` | `CN=A9DA431F-AED2-4437-AE71-F63E7D8FAED3` |
| `Package/Properties/PublisherDisplayName` | `Alexandre da Costa` |
| Versão do pacote | `1.1.1.0` |
| Pacote | `dist/Hangar_1.1.1.0_x64.appx` (162,1 MB) |

## Nome e descrição

**Nome do produto:** Hangar - AI Cockpit

**Descrição curta (pt-PT, 213 caracteres):**

> Gestor local de agentes e modelos de IA para Windows. Uma consola real por agente, várias sessões em paralelo no mesmo ecrã, instalação e remoção a partir dos repositórios que inscrever. Sem conta, sem telemetria.

**Descrição (pt-PT):**

> O Hangar é um posto de comando para trabalhar com várias inteligências artificiais ao mesmo tempo, cada uma na sua própria consola, no mesmo ecrã.
>
> A aplicação abre sem modelo nem agente predefinido: valida o equipamento, o sistema e o catálogo, e entrega o controlo antes de qualquer conversa começar. Cada AI assinalada abre o seu separador e a sua própria sessão; alternar de separador muda a conversa e mantém o contexto das restantes.
>
> A partir dos repositórios inscritos — Ollama, Hugging Face, GitHub e OpenRouter — o Hangar gera novas instalações com a mesma simplicidade com que remove as que já existem. A pesquisa na web parte dessas fontes e a pesquisa de modelos aceita um tema escrito pelo utilizador, com resultados ordenados face ao equipamento.
>
> A cor é usada como aviso: quando a remoção está armada, as caixas e o ícone passam a vermelho. A consola permite ajustar a altura por arrastamento da aresta superior e redimensionar cada sessão.
>
> Tudo corre na máquina do utilizador. Não há conta, não há telemetria e não há custo.
>
> Conceito, design e interação: ALDACO — Alexandre da Costa. Código sob licença MIT.

**Short description (en-US, 188 caracteres):**

> Local manager for AI agents and models on Windows. A real console per agent, several sessions side by side, install and remove from the repositories you register. No account, no telemetry.

## Categoria e requisitos

| Campo | Valor |
| --- | --- |
| Categoria | Desenvolvimento de software → Ferramentas de programação |
| Subcategoria alternativa | Ferramentas de TI → Administração de sistemas |
| Sistema mínimo | Windows 10 versão 1809 (build 17763), x64 |
| Arquitetura | x64 |
| Preço | Gratuito |
| Idioma do pacote | pt-PT, en-US |

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
12. Sem conta, sem telemetria, sem custo

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
| `StoreLogo.png` | 50x50 | Ficha da loja |
| `Square44x44Logo.png` | 44x44 | Lista de aplicações |
| `Square150x150Logo.png` | 150x150 | Mosaico |
| `Wide310x150Logo.png` | 310x150 | Mosaico largo |
| `SplashScreen.png` | 620x300 | Ecrã de arranque |

## Declarações

**Telemetria:** a aplicação não recolhe telemetria nem envia dados para servidores
próprios. As consultas de rede ocorrem apenas quando o utilizador as inicia, para
as fontes que inscreveu.

**Instalação de terceiros:** Ollama e as CLI são instalados apenas após
confirmação explícita do utilizador, em conformidade com a política 10.1.x.

**Privacidade:** não há conta nem perfil de utilizador. Os dados ficam em
`%APPDATA%\Hangar\data`.

**Contacto de suporte:** o repositório público
<https://github.com/nunodacosta/hangar-ai-cockpit> serve de canal de suporte.

## Sequência de submissão

1. Partner Center → *Pacotes* → carregar `dist/Hangar_1.1.1.0_x64.appx`.
2. *Listagem da loja* → colar os textos acima e carregar as sete capturas.
3. *Classificação etária* → questionário IARC.
4. *Preços e disponibilidade* → gratuito, mercados pretendidos.
5. *Enviar para certificação* — prazo típico de 1 a 3 dias úteis.

Cada nova submissão tem de aumentar a versão: o manifesto exige quatro
componentes e `tools/build-appx.js` converte `1.1.1` em `1.1.1.0`.
