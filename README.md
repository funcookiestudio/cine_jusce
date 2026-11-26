# Cine Jusce

*Filmes estranhos de produtoras duvidosas.*

Site para assistir filmes junto, cada um na sua casa, conversando por voz.
Feito para sessões entre amigos de infância da escola Juscelino Kubitschek.

## Como usar

1. **Quem passa o filme** toca em **Criar sala**, envia o link e toca em
   **Compartilhar**. Escolhe a aba do filme e marca "Compartilhar áudio da guia".
2. **Quem assiste** abre o link (vê o ingresso VIP dourado) e toca em **Entrar**.
3. No botão de perfil (canto superior direito) dá para trocar o nome, a
   qualidade (720p/1080p), o microfone ao entrar e o visual
   (Cortina, Marquise ou Locadora).

Sem cadastro. Funciona no Chrome e no Edge (compartilhar a tela pede um computador).

## Como funciona

- **Tudo em `index.html`**: interface, voz e vídeo, sem build.
- **Conexão direta entre as pessoas (WebRTC)** pelo [PeerJS](https://peerjs.com/).
  O servidor público da PeerJS só apresenta as pessoas; voz e vídeo vão direto.
- **Voz**: todo mundo fala com todo mundo (Opus 128 kbps, cancelamento de eco).
  Bom até umas 4 ou 5 pessoas.
- **Filme**: o anfitrião envia uma cópia para cada convidado (até 1080p / 8 Mbps,
  som estéreo 510 kbps). Com mais convidados, cada cópia fica mais leve.
- **Retransmissão (TURN)**: quando a conexão direta não passa, o vídeo vai pelo
  TURN da Cloudflare. O `worker.js` gera credenciais temporárias em
  `/turn-credentials`, só para o próprio site.

## Arquivos

| Arquivo | Para quê |
| --- | --- |
| `index.html` | O site inteiro |
| `worker.js` | Cloudflare Worker: serve o site e as credenciais de TURN |
| `wrangler.jsonc` | Configuração do Worker |
| `.assetsignore` | O que não é publicado como parte do site |

## Publicação

- **Cloudflare Workers**: `https://cine-jusce.funcookiestudio.workers.dev`
  Segredos do Worker (Settings → Variables and Secrets, tipo Secret):
  `TURN_KEY_ID` e `TURN_KEY_API_TOKEN`, da chave em Realtime → TURN Server.
  Nunca coloque essas chaves no código.
- **GitHub Pages**: cópia em `https://funcookiestudio.github.io/cine_jusce`
  (usa o mesmo TURN do Worker).

## Limites conhecidos

- Netflix, Prime Video e outros com proteção contra cópia geralmente aparecem
  pretos ao compartilhar a tela. É uma trava deles.
- O botão Pausar avisa todos e congela a imagem dos convidados, mas o anfitrião
  precisa pausar o filme na aba dele: o navegador não deixa um site controlar
  outra aba.
- Se o anfitrião sair, a sala acaba.

---

FUN🍪COOKIE STUDIO
