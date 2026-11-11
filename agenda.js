/* =====================================================================
   AGENDA DA TEMPORADA — RUMO PELO BRASIL
   Para atualizar o site, edite SOMENTE a área "DADOS" abaixo.
   - destaque: id do destino que aparece no vídeo da página inicial
   - saida / retorno: 'AAAA-MM-DD' ou null (null = "data em definição")
   - duracao: 'BATE E VOLTA', '2 DIAS / 1 NOITE', '3 DIAS / 2 NOITES'...
   - valor: guardado para uso futuro; NÃO aparece nos cards (o valor fica na página do roteiro)
   - status: 'aberta' | 'ultimas' | 'esgotado' | null (null = sem etiqueta)
             'adiada' = sem etiqueta extra; o selo da data passa a dizer ADIADA (até você pôr a nova data em 'saida')
   - video / videoHorizontal: vídeo do destaque (vertical 9:16 / horizontal 16:9); sem horizontal, usa o vertical
   - corTitulo: cor da última palavra do título: 'amarelo' (padrão) ou 'vermelho'. Nome de uma palavra só fica branco
   - imagem: nome do arquivo na pasta do site (null = fundo colorido da Rumo)
   - roteiro: página do roteiro (null = botão leva ao WhatsApp)
   ===================================================================== */
var RUMO = {
  // ----------------------------- DADOS -----------------------------
  whatsapp: '5515981255038',
  destaque: 'angra-dos-reis',
  layoutDestaque: 'vertical',   // 'vertical' (original) ou 'horizontal' (16:9). Teste sem editar: index.html?destaque=horizontal
  limiteHome: 4,                // quantos cards aparecem na página inicial (a agenda completa mostra todos)
  destinos: [
    {
      id: 'angra-dos-reis', nome: 'Angra dos Reis', estado: 'RJ',
      imagem: 'Letreiro de Angra dos Reis no Pier.png', video: 'snapinsta-1788302359004.mp4', videoHorizontal: null,
      textoDestaque: 'Nosso próximo rumo: um bate e volta em Angra dos Reis. Data, valores e roteiro em definição.',
      saida: null, retorno: null, duracao: 'BATE E VOLTA', modalidade: null,
      valor: null, status: null, roteiro: 'angra.html', ordem: 1, corTitulo: 'vermelho'
    },
    {
      id: 'ilha-do-mel', nome: 'Ilha do Mel', estado: 'PR',
      imagem: 'ChatGPT Image 20 de set. de 2026, 03_36_58.png', video: null, videoHorizontal: null, textoDestaque: null,
      saida: null, retorno: null, duracao: 'BATE E VOLTA', modalidade: 'bate e volta - Domingão na ilha',
      valor: 'R$ 499,90', status: 'adiada', roteiro: 'ilhadomel.html', ordem: 2, corTitulo: 'amarelo'
    },
    {
      id: 'trindade', nome: 'Trindade', estado: 'RJ',
      imagem: 'https://viajala.com.br/news/wp-content/uploads/2025/11/trindade-rj-o-que-fazer.jpg', video: null, videoHorizontal: null, textoDestaque: null,
      saida: null, retorno: null, duracao: null, modalidade: null,
      valor: null, status: null, roteiro: null, ordem: 3
    }
  ]
  // -------------------------- FIM DOS DADOS ------------------------
};

(function () {
  if (typeof document === 'undefined') return;
  var MES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  var STATUS = {
    aberta:   ['RESERVAS ABERTAS', 'ag-aberta'],
    ultimas:  ['ÚLTIMAS VAGAS', 'ag-ultimas'],
    esgotado: ['ESGOTADO', 'ag-esgotado']
  };
  var SETA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12H19M13 6L19 12L13 18"/></svg>';

  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function dia(iso) { var p = iso.split('-'); return { d: +p[2], m: MES[+p[1] - 1], a: p[0] }; }
  function dataTexto(d) {
    if (!d.saida) return d.status === 'adiada' ? 'ADIADA' : 'DATA EM DEFINIÇÃO';
    var s = dia(d.saida);
    if (d.retorno && d.retorno !== d.saida) {
      var r = dia(d.retorno);
      return s.d + (s.m !== r.m ? ' ' + s.m : '') + ' – ' + r.d + ' ' + r.m + ' ' + r.a;
    }
    return s.d + ' ' + s.m + ' ' + s.a;
  }
  function link(d) {
    return d.roteiro || ('https://wa.me/' + RUMO.whatsapp + '?text=' + encodeURIComponent('Oi! Quero saber mais sobre a viagem para ' + d.nome + '.'));
  }
  function alvo(d) { return d.roteiro ? '' : ' target="_blank" rel="noopener"'; }
  function achar(id) { for (var i = 0; i < RUMO.destinos.length; i++) if (RUMO.destinos[i].id === id) return RUMO.destinos[i]; return RUMO.destinos[0]; }
  function ordenar(lista) {
    return lista.slice().sort(function (a, b) {
      if (a.saida && b.saida) return a.saida < b.saida ? -1 : 1;
      if (a.saida) return -1; if (b.saida) return 1;
      return (a.ordem || 99) - (b.ordem || 99);
    });
  }

  function titulo(nome, cor) {
    var w = nome.split(' ');
    if (w.length < 2) return esc(nome);
    var ult = w.pop();
    return esc(w.join(' ')) + '<span class="cor-' + (cor === 'vermelho' ? 'vermelho' : 'amarelo') + '">' + esc(ult) + '</span>';
  }

  function card(d) {
    var st = d.status && STATUS[d.status];
    var ancora = 'position:absolute;top:0;right:0;bottom:0;left:0;';
    var img = d.imagem ? "background-image:url('" + encodeURI(d.imagem) + "');" : '';
    return '<article class="ag-card">' +
      '<div class="ag-capa" style="position:relative;aspect-ratio:4/3;overflow:hidden;">' +
        '<a class="' + (d.imagem ? '' : 'duo-2') + '" href="' + link(d) + '"' + alvo(d) + ' aria-label="' + esc(d.nome) + '" style="' + ancora + 'background-size:cover;background-position:center;' + img + '"></a>' +
        '<span style="' + ancora + 'background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.12) 55%,rgba(0,0,0,0) 100%);pointer-events:none;"></span>' +
        '<div class="ag-topo" style="pointer-events:none;">' + (st ? '<span class="ag-status ' + st[1] + '">' + st[0] + '</span>' : '') +
          '<span class="ag-datachip">' + dataTexto(d) + '</span></div>' +
        '<h3 class="ag-titulo display" style="pointer-events:none;">' + titulo(d.nome, d.corTitulo) + '</h3>' +
      '</div>' +
      '<div class="ag-corpo">' +
        '<div class="ag-tags"><span class="ag-tag ag-uf">' + esc(d.estado) + '</span>' + (d.duracao ? '<span class="ag-tag ag-dur">' + esc(d.duracao) + '</span>' : '') + '</div>' +
        (d.modalidade ? '<div class="ag-item"><strong>Formato:</strong> ' + esc(d.modalidade) + '</div>' : '') +
        '<div class="ag-rodape">' +
          '<a class="ag-btn" href="' + link(d) + '"' + alvo(d) + '>Conhecer roteiro ' + SETA + '</a>' +
        '</div>' +
      '</div></article>';
  }

  function embreve() {
    return '<article class="ag-card ag-embreve"><div class="ag-corpo">' +
      '<h3 class="ag-nome display">Próximo <span>rumo</span></h3>' +
      '<p class="ag-mod">Já estamos desenhando as próximas viagens. Fale com a gente para ser avisado em primeira mão.</p>' +
      '<div class="ag-rodape"><a class="ag-btn" href="https://wa.me/' + RUMO.whatsapp + '" target="_blank" rel="noopener">Fale com a Rumo ' + SETA + '</a></div>' +
      '</div></article>';
  }

  function destaque(el) {
    var d = achar(RUMO.destaque);
    var m = (location.search.match(/destaque=(vertical|horizontal)/) || [])[1] || RUMO.layoutDestaque;
    var horizontal = m === 'horizontal';
    var grid = el.parentNode;
    if (grid && grid.classList) grid.classList[horizontal ? 'add' : 'remove']('dest-horizontal');
    var src = horizontal ? (d.videoHorizontal || d.video) : d.video;
    var semVideo = '<div class="dest-sem-video duo-2"><span class="display">' + esc(d.nome) + '</span></div>';
    var stickers = '<span class="sticker hero-sticker-1">✦ DESTINO EM DESTAQUE</span>' +
                   '<span class="sticker hero-sticker-2">' + esc(d.nome) + ' — ' + esc(d.estado) + '</span>';
    if (!horizontal) {
      el.innerHTML = '<div class="hero-foto insta-embed">' +
        (src ? '<video src="' + esc(src) + '" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;border:0;"></video>' : semVideo) +
        '</div>' + stickers;
      return;
    }
    el.innerHTML = '<div class="dest-video">' +
      (src ? '<video src="' + esc(src) + '" autoplay loop muted playsinline controls preload="metadata" aria-label="Vídeo de ' + esc(d.nome) + '"></video>' : semVideo) +
      '</div>' + stickers +
      '<div class="dest-info"><div><h2 class="display">' + esc(d.nome) + ' <span>' + esc(d.estado) + '</span></h2>' +
      (d.textoDestaque ? '<p>' + esc(d.textoDestaque) + '</p>' : '') +
      '</div><a class="btn btn-terracota" href="' + link(d) + '"' + alvo(d) + '>Conhecer roteiro</a></div>';
  }

  function iniciar() {
    var el = document.getElementById('destaque'); if (el) destaque(el);
    var ord = ordenar(RUMO.destinos);
    var home = document.getElementById('agenda-home');
    if (home) home.innerHTML = ord.slice(0, RUMO.limiteHome).map(card).join('') + embreve();
    var lista = document.getElementById('agenda-lista');
    if (lista) lista.innerHTML = ord.map(card).join('') + embreve();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
