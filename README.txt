Hangar - AI Cockpit (codigo-fonte)

O conceito do nome: Hangar
  Um hangar é o local onde uma frota de aeronaves fica estacionada,
  recebe manutenção e é preparada para a descolagem. É esse o papel da
  aplicação face aos agentes e modelos de IA do computador: deteta-os e
  agrupa-os (a frota estacionada no hangar), instala-os e remove-os com
  confirmação explícita (a manutenção) e lança cada um na sua própria
  sessão (a descolagem). "AI Cockpit" é mantido como segundo título e
  assinatura: o hangar é onde a frota vive, o cockpit é o posto de
  comando de onde se pilota. A aplicação junta as duas coisas, gerir a
  frota no Hangar e pilotá-la a partir do AI Cockpit. O ícone acompanha
  a mesma ideia, um prompt de terminal (>_) com faíscas de IA, porque a
  linha de comandos é a manche deste cockpit.

Software a que pode ser alternativa
  Hangar - AI Cockpit é um gestor local de IA para Windows: deteta os
  agentes CLI instalados, instala e conversa com modelos Ollama e abre
  uma consola interativa por agente, com inventário do host e resultados
  guardados cifrados. Na mesma categoria, pode ser uma alternativa
  (total ou parcial) a:
  - Pinokio: launcher open source (MIT) que instala e executa aplicações
    de IA completas com um clique, via scripts, em Windows, macOS e
    Linux. Hangar ocupa o mesmo lugar de base local de IA, mas foca em
    agentes de linha de comandos e modelos Ollama com consola
    integrada, em vez de aplicações web completas instaladas por scripts.
  - LM Studio: cliente desktop gratuito (proprietário) para
    descarregar, gerir e conversar com modelos locais, com runtime
    próprio. Hangar cobre o mesmo fluxo sobre o runtime Ollama e
    acrescenta a gestão dos agentes CLI e o inventário cifrado do host.
  - Jan: plataforma open source de IA offline com modelos locais e
    chat. Hangar diferencia-se pela consola interativa (PowerShell com
    fallback para CMD) e pelo arranque direto dos agentes instalados.
  - GPT4All: executa e conversa com modelos locais em CPU/GPU. Hangar
    acrescenta a vertente de gestor dos CLIs de IA detetados no sistema
    e das fontes de modelos configuráveis.
  - Open WebUI: interface web para o Ollama. Hangar cumpre o papel sem
    browser, em janela própria, com consola integrada para os agentes.
  As comparações servem para enquadrar a categoria; o âmbito de cada
  produto é próprio.

Executar em modo desenvolvimento (precisa de Node.js):
  1. Extraia TODO o conteudo do zip para uma pasta (ex.: C:\Apps\hangar).
  2. Duplo clique em start.bat  (instala o Electron na 1a vez).
  A aplicacao abre numa janela Electron propria, sem depender de um browser.

Gerar os executaveis (portatil + instalador):
  npm install
  npm run dist          -> pasta dist\

Os dados (settings e logs) ficam na pasta "data" junto ao executavel.

Notas de compilacao:
  O node-pty usa binarios N-API pre-compilados, por isso a recompilacao de
  dependencias nativas esta desativada ("npmRebuild": false na configuracao
  "build"). Permite compilar com o Electron atual sem precisar de Python/
  Visual Studio Build Tools.

Resolucao de problemas (Windows) - janela abre sem interface:
  A sandbox do Chromium precisa de ler a pasta do Electron. Se as permissoes
  (ACL) dessa pasta tiverem entradas de AppContainer sem "ALL APPLICATION
  PACKAGES", os processos em sandbox nao arrancam e a janela fica vazia.
  A aplicacao deteta essa falha (exit 0xC0000135), guarda o marcador
  data\sandbox-unavailable e reabre-se sem sandbox; nos arranques seguintes
  usa esse marcador. Para voltar a usar a sandbox, apague o marcador depois de
  corrigir as permissoes:
    icacls "<pasta da aplicacao>" /grant *S-1-15-2-1:(OI)(CI)(RX)

Nota de autoria: a ideia, o conceito, o design e o fluxo de interação deste
projeto são atribuídos a ALDACO. O símbolo AI original é mantido no rodapé.

Modelos locais
  Em cada arranque, a aplicação recolhe informação do host, carrega primeiro o
  catálogo cifrado anterior e inicia uma atualização online das fontes
  configuradas, incluindo os sites personalizados. A lista em cache continua
  disponível enquanto a atualização decorre; se uma fonte estiver indisponível,
  os seus últimos resultados são preservados e identificados como desatualizados.
  A atualização recolhe metadados publicados de versões, tamanhos, descrições,
  ajuda e popularidade quando a fonte os disponibiliza, e atualiza as estimativas
  de instalação com os recursos do host. O painel também permite adicionar
  novos sites através do endereço web; o endereço é guardado em
  data\settings.json e a análise começa imediatamente.
  As páginas personalizadas são limitadas a http/https, endereços públicos,
  redirecionamentos controlados e 2 MB de conteúdo. O inventário do host é
  guardado cifrado em data\host.enc e o catálogo/resultados das fontes em
  data\cli.enc.
  A landing page mostra cartões com um resumo do host (CPU, RAM, GPU,
  armazenamento e Ollama; sem expor endereços IP) e da validação das fontes.
  Agentes e modelos aparecem em cartões com a comparação à última atualização
  guardada: novos, alterados, sem alterações ou dados em cache por fonte
  indisponível. A adequação dos modelos continua a ser uma estimativa, não um
  benchmark. Ao passar o rato ou clicar num repositório, o relatório central
  apresenta os dados atuais dessa fonte; a seleção mais recente prevalece se
  consultas se sobrepuserem.
  A chave dos ficheiros cifrados é protegida pelo armazenamento seguro do sistema
  operativo quando disponível. Sem esse recurso, é derivada da identidade local
  do utilizador e da máquina.

  O painel recomenda modelos da Ollama Library e instala-os com "ollama pull".
  Os itens detetados ficam agrupados como agentes e os modelos locais instalados
  aparecem numa secção separada. Cada entrada permite iniciar diretamente a AI;
  a ajuda contextual está disponível pelo ícone dedicado. Após um download
  concluído, o modelo é selecionado automaticamente no painel lateral.
  Não é necessário instalar o Ollama antes de iniciar a aplicação. Ao pedir a
  instalação de um modelo local, a aplicação verifica o runtime e, se necessário,
  oferece a instalação oficial numa janela de terminal visível, apenas após a
  confirmação do utilizador. No Windows, é usado o comando oficial do Ollama
  para PowerShell; se o PowerShell não estiver disponível, a aplicação pede a
  sua instalação e liga à página oficial. Em macOS/Linux, é usado o comando
  oficial do script de instalação num terminal gráfico. A aplicação volta a
  verificar o runtime e usa o executável instalado mesmo que a sessão atual
  ainda não tenha recebido a alteração de PATH. Os grupos cloud só incluem
  modelos explicitamente assinalados como cloud pela fonte; estes não são
  instalados localmente. Tamanho e adequação à máquina são estimativas, não
  resultados de benchmarks. As classificações de instalação são estimativas;
  compatibilidade não confirmada e metadados ausentes são apresentados como
  desconhecidos, não inferidos. Preços e licenças não são inferidos.

  As notificações de sucesso, informação, aviso e erro são apresentadas em
  mensagens toast. A desinstalação mantém uma confirmação explícita; os modelos
  instalados aparecem junto dos CLIs detetados e são removidos com "ollama rm"
  apenas após confirmação. O ícone Launch abre no painel central uma consola
  interativa (PowerShell, com fallback para CMD no Windows) para executar comandos.
  Ao iniciar uma conversa, cada agente/modelo selecionado abre o seu próprio
  separador e mantém uma sessão independente; o carrossel dos separadores
  desloca-se automaticamente ao passar o rato, pode ser navegado com a roda
  sobre a faixa e para quando um separador é clicado. Cada separador mostra o
  nome da entidade AI correspondente; "PowerShell" e o botão de fechar ficam
  fixos no cabeçalho. O menu flutuante começa no canto inferior esquerdo da
  consola e pode ser reposicionado com Ctrl+arrastar até uma largura do botão
  para fora dos limites da consola, sem ultrapassar os limites da janela. A
  opção de diretório muda o diretório de trabalho do agente ou inclui ficheiros
  da pasta como contexto do modelo. Imagens e ficheiros podem ser anexados a uma
  mensagem de modelo; para agentes, os caminhos são colados na consola sem
  submeter, como numa colagem de texto. Até 32 ficheiros de texto
  suportados (32 KB por ficheiro e 256 KB no total) são incluídos como contexto
  da pasta; pastas ocultas e ficheiros com nomes potencialmente sensíveis são
  ignorados. A conversa aceita até 5 imagens e até 8 MB de imagens por pedido.
  O modelo recebe apenas o texto/imagens selecionados, não tem acesso direto
  ao disco e não pode editar ficheiros. Ocultar a consola preserva as sessões;
  estas terminam quando a aplicação fecha.
  A consola usa pseudo-terminal e xterm.js, preservando cores, progresso numa só
  linha, atalhos interativos e redimensionamento. O ícone de ajuda, junto ao Launch,
  mostra exemplos e a saída nativa
  de --help para o único CLI selecionado. O painel esquerdo indica quantas
  pastas distintas contêm cada executável. Os novos CLIs detetados por reanálise
  são selecionados automaticamente quando há apenas um novo; o progresso dos
  downloads apresenta uma barra com extremidades arredondadas. O botão de reanálise atualiza a lista
  a partir das localizações comuns e apresenta uma notificação do resultado. A
  ajuda pode ser aberta pelo ícone dedicado; sem CLI selecionado, permite escolher
  um dos CLIs detetados, sem abrir a ajuda ao clicar no nome na lista.

  A pesquisa da página central só é executada após o utilizador escrever um
  critério e iniciar a pesquisa. Consulta o Hugging Face Hub e o DuckDuckGo,
  além de procurar no catálogo Ollama guardado localmente. Os modelos Ollama
  encontrados podem ser instalados pela aplicação; resultados externos abrem
  a respetiva página de origem. Cada pesquisa guarda os modelos, páginas e
  metadados cifrados em data\search.enc. Os relatórios e o histórico de pesquisa
  aparecem no painel central; o painel direito fica dedicado à lista de
  repositórios e à gestão dos respetivos endereços. O histórico só é carregado
  na interface após uma pesquisa explícita, nunca no arranque. O relatório
  comparativo da pesquisa fica separado do relatório da fonte consultada. As
  seleções de agentes e modelos instalados são guardadas nas definições e
  restauradas entre sessões. Após a instalação,
  os detalhes ficam cifrados em data\cli.enc e são apresentados na landing page
  e na lista lateral.
