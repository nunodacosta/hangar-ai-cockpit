# Hangar — AI Cockpit

Gestor local de agentes e modelos de IA para Windows. Deteta os **CLI** instalados, instala e remove agentes com confirmação explícita, consulta modelos no Ollama, Hugging Face, GitHub e OpenRouter, e abre **uma consola por agente**, todas em paralelo no mesmo ecrã.

Livre, gratuito e de código aberto (MIT). Sem conta, sem telemetria, sem limites de utilização.

![Arranque sem AI selecionada](docs/screenshots/arranque.png)

## Porque existe

Nasceu de uma necessidade concreta: desinstalar as CLI que já existiam na máquina de forma fácil e prática. Do desinstalar passou-se ao instalar, e daí aos automatismos — pesquisa na web a partir dos repositórios inscritos e pesquisa de modelos por tema escrito pelo utilizador.

## O que o distingue

- **Várias AIs em simultâneo.** Cada agente escolhido abre o seu separador com a sua própria sessão. Alternar de separador muda a conversa, mantém o contexto e não interrompe as outras.
- **Arranque sem AI selecionada.** Não há modelo nem agente predefinido: a aplicação valida o equipamento e entrega o controlo ao utilizador.
- **Inventário único.** Agentes instalados e modelos no mesmo painel, em cartões com nome, pastas e versão.
- **Cor como linguagem.** As caixas de seleção usam a cor da interface; ficam vermelhas com o ícone de eliminação ativo e verdes com o ícone de conversa ativo — o mesmo controlo, dois significados legíveis sem texto.
- **Menu flutuante contextual.** Um ícone, quatro ações (diretório, imagem, ficheiros, limpar diretório). Em agentes cola os caminhos na consola; em modelos abre o diálogo nativo do sistema. Arrasta-se com `Ctrl` ao longo da margem da consola, com o deslocamento limitado a uma largura de ícone para lá dessa margem.

| Cartões no painel esquerdo | Ícone de eliminação ativo |
| --- | --- |
| ![Cartões](docs/screenshots/cartoes.png) | ![Vermelho](docs/screenshots/perigo.png) |

| Conversa com ícone verde | Menu flutuante |
| --- | --- |
| ![Conversa](docs/screenshots/conversa.png) | ![Menu](docs/screenshots/menu.png) |

![Pesquisa de modelos por tema](docs/screenshots/pesquisa.png)

## Instalação

### Portátil (sem instalar)

1. Descarregue `Hangar_Portable.exe` da [última release](../../releases/latest).
2. Execute o ficheiro. Não escreve no registo nem cria atalhos.

### Setup (instalador)

1. Descarregue `Hangar_Setup.exe` da [última release](../../releases/latest).
2. Escolha a pasta de instalação; são criados atalhos no ambiente de trabalho e no menu Iniciar.
3. A desinstalação está disponível em Aplicações instaladas.

> Os executáveis não são assinados digitalmente. O Windows SmartScreen pode pedir confirmação em «Mais informações → Executar mesmo assim».

### A partir do código

```bash
npm install
npm start          # aplicação Electron
npm run web        # apenas o servidor local, no browser
npm run dist       # gera portátil e setup em dist/
```

Requer Node.js 20 ou superior. `node-pty` é compilado na instalação.

## Como usar

1. Arranque a aplicação — nenhuma AI vem selecionada.
2. Assinale um ou mais agentes ou modelos no painel esquerdo.
3. Carregue no ícone de conversa (fica verde) para abrir uma sessão por entidade.
4. Alterne entre separadores para mudar de conversa sem interromper as restantes.
5. Use o ícone flutuante para escolher diretório ou anexar imagem e ficheiros.

## Dados e privacidade

- Tudo corre na máquina. O catálogo, o inventário do host e os resultados de pesquisa são guardados em `data/`, cifrados com uma chave protegida pelo `safeStorage` do sistema.
- Nenhum dado é enviado para servidores da ALDACO. As consultas a fontes externas (Ollama local, Hugging Face, GitHub, OpenRouter) são feitas diretamente a partir da aplicação.

## Estrutura

```
main.js          processo principal Electron, IPC da consola e do menu
preload.js       ponte segura para a interface
server.js        servidor local, catálogo, deteção e cifra
public/          interface (index.html, ícones, service worker)
build/           ícones do empacotamento
tools/           utilitários de desenvolvimento
docs/screenshots capturas usadas neste README
```

## Licença

MIT — ver [LICENSE](LICENSE). Conceito, design e interação: Alexandre da Costa / ALDACO.
