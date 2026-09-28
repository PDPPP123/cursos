# Cursos

Seus cursos em vídeo, offline, no estilo Netflix. Funciona no iPhone (Safari, instalado na Tela de Início) e no PC (Chrome/Edge). É um PWA gratuito: sem backend, sem dependências e sem CDNs. Os vídeos ficam guardados **no próprio aparelho**.

```
index.html             app completo (HTML + CSS + JS + worker de importação)
sw.js                  service worker (funciona offline)
manifest.webmanifest   dados de instalação
icon-192.png, icon-512.png, apple-touch-icon.png
```

## O que ele faz

- **Episódios em ordem:** usa o número no início do nome do arquivo (`2_...`, `13_1_...`: 1, 2, 10). Sem número, usa a data do arquivo, ou seja, a ordem do download. Os títulos aparecem limpos: `20_9_Content.mp4` vira **"19. Content"**.
- **Miniaturas reais:** cada episódio ganha uma miniatura tirada de um quadro do próprio vídeo, gerada em segundo plano depois da importação.
- **Maratona:** retoma de onde parou e passa para o próximo episódio sozinho, com contagem de 5 s que dá para cancelar. Marca o episódio como assistido em 90% e lembra a velocidade (1x a 2x).
- **Início:** mostra "Continuar assistindo" (inclusive o próximo episódio de quem terminou um), "Meus cursos" e "Concluídos".
- **Biblioteca:** estatísticas e filtros (em andamento, não iniciados, concluídos).
- **Curso:** filtro "não assistidos/assistidos", módulos recolhíveis, renomear e apagar.
- **Tela de bloqueio:** título do episódio e do curso, com botões de ±10 s e próximo.

## Publicar grátis no GitHub Pages

1. Crie uma conta em [github.com](https://github.com) e um repositório **público** (ex.: `cursos`).
2. **Add file → Upload files** e envie os 7 arquivos desta pasta para a raiz.
3. **Settings → Pages → Build and deployment**: *Deploy from a branch*, branch `main`, pasta `/ (root)` → **Save**.
4. Em 1–2 minutos o app estará em `https://SEU-USUARIO.github.io/cursos/`.

Os vídeos **não** vão para o GitHub. Eles ficam só no aparelho onde forem importados.

**Para atualizar depois:** altere os arquivos e aumente a versão no `sw.js` (`cursos-v1` → `cursos-v2`). Abra o app uma vez com internet e depois feche e abra de novo.

## Instalar no iPhone

1. Abra o endereço no **Safari**. Não use o Chrome do iPhone.
2. Toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início** → **Adicionar**.
3. Use sempre pelo ícone. Instalado, o app abre em tela cheia, funciona sem internet e o iOS libera **muito mais espaço** (até cerca de 60% do armazenamento do aparelho). Os vídeos também não são apagados por falta de uso.

**PC (Chrome/Edge):** abra o endereço e clique em **Instalar** na barra de endereço.

## Espaço de armazenamento

O limite é do navegador, não do app. Veja o espaço livre em **Ajustes**.

| Onde | Limite aproximado |
|---|---|
| iPhone, app instalado na Tela de Início | ~60% do armazenamento do aparelho |
| iPhone, só no Safari (sem instalar) | bem menor, e pode ser apagado após 7 dias sem uso |
| Chrome/Edge no PC | ~60% do disco |

## Criar os zips

- **Um zip por curso.** O nome do zip vira o nome do curso, e dá para renomear depois dentro do app.
- **Subpastas viram módulos**; sem subpastas, o curso tem um módulo só.
- Numere os arquivos (`01 Introdução.mp4`) ou mantenha os nomes com número que o curso já tem.
- Uma imagem `capa.jpg` vira a capa. Sem ela, a capa é o quadro do primeiro episódio.

**Crie o zip SEM compressão.** Vídeo já é comprimido, e assim a importação é só uma cópia, muito mais rápida.

- **Windows ([7-Zip](https://www.7-zip.org)):** botão direito na pasta → 7-Zip → *Adicionar ao arquivo...* → formato **zip**, nível **Armazenar**.
- **Mac/Linux:** `zip -r -0 "React Native.zip" "React Native"`.

Zips acima de 4 GB (ZIP64) funcionam. Zips divididos (`.z01`) ou com senha, não.

**Levar para o iPhone:** coloque o zip no app **Arquivos** (iCloud Drive, AirDrop, cabo ou pendrive). No app, toque em **Importar** e mantenha a tela ligada até terminar. Se interromper, importe o mesmo zip de novo: o que já foi importado é pulado.

**Formatos:** MP4/M4V/MOV com H.264 + AAC. MKV e AVI não tocam no iPhone; converta com o [HandBrake](https://handbrake.fr) (preset "Fast 1080p30").

## Testar no PC

Abrir o `index.html` direto não funciona, porque o app precisa de `http://localhost` ou `https://`. Com [Node.js](https://nodejs.org) instalado, rode `npx serve .` nesta pasta e abra o endereço mostrado.

Atalhos no PC: ←/→ ±10 s, espaço pausa, F tela cheia, N próximo episódio, Esc fecha.

## Como funciona (técnico)

- **Leitura do zip:** o índice (central directory) é lido pelo fim do arquivo com `File.slice()`, com suporte a ZIP64. O zip nunca é carregado inteiro na memória.
- **Extração:** um Web Worker copia os vídeos em fatias de 8 MB. Entradas *deflate* são descompactadas com `DecompressionStream('deflate-raw')`.
- **Gravação:** os vídeos vão para o OPFS com `createSyncAccessHandle`, que funciona no Safari do iOS. `createWritable` é a alternativa quando o primeiro não existe.
- **Dados:** o IndexedDB guarda cursos, aulas, progresso e miniaturas. O progresso pode ser exportado/importado em JSON (por nome do curso + caminho da aula).
