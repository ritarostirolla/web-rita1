/**
 * Rita Rostirolla — padrão Hotmart checkout (todas as LPs em 40-web)
 *
 * Hotmart webhook usa purchase.origin:
 *   src → origem da página de vendas
 *   sck → origem do checkout (produtor)
 *
 * Hub [RR] Vendas mapeia: src → utm_source · sck → utm_medium
 * (e, se sck vier composto medium|campaign|content|term, o Hub pode expandir)
 *
 * Uso:
 *   1) window.GSP_CHECKOUT = 'https://pay.hotmart.com/XXXX'
 *   2) <a class="js-checkout" href="#checkout">
 *   3) <script src="../js/hotmart-checkout.js" defer></script>
 */
(function (global) {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORAGE_KEY = 'rita_hotmart_utms';

  function readPageParams() {
    var out = {};
    try {
      var params = new URLSearchParams(global.location.search);
      UTM_KEYS.concat(['src', 'sck', 'xcod']).forEach(function (k) {
        var v = params.get(k);
        if (v) out[k] = v;
      });
    } catch (_) {}
    return out;
  }

  function readStored() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function writeStored(map) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  /** Captura UTMs da URL e persiste na sessão (primeira visita ganha). */
  function captureTracking() {
    var page = readPageParams();
    var stored = readStored();
    var merged = Object.assign({}, stored);
    Object.keys(page).forEach(function (k) {
      if (page[k]) merged[k] = page[k];
    });
    writeStored(merged);
    return merged;
  }

  function buildSck(track) {
    if (track.sck) return track.sck;
    var parts = [
      track.utm_medium || '',
      track.utm_campaign || '',
      track.utm_content || '',
      track.utm_term || ''
    ];
    var joined = parts.join('|').replace(/\|+$/g, '');
    if (joined && joined !== '|||') return joined;
    return track.utm_medium || '';
  }

  function buildSrc(track) {
    if (track.src) return track.src;
    return track.utm_source || '';
  }

  /**
   * Monta URL de checkout Hotmart com utm_* + src + sck.
   * Não inventa origem se a página não trouxe tracking.
   */
  function buildCheckoutUrl(baseUrl, trackOpt) {
    if (!baseUrl || baseUrl === '#checkout') return baseUrl;
    try {
      var track = trackOpt || captureTracking();
      var dest = new URL(baseUrl, global.location.href);

      UTM_KEYS.forEach(function (k) {
        if (track[k]) dest.searchParams.set(k, track[k]);
      });

      var src = buildSrc(track);
      var sck = buildSck(track);
      if (src) dest.searchParams.set('src', src);
      if (sck) dest.searchParams.set('sck', sck);
      if (track.xcod) dest.searchParams.set('xcod', track.xcod);

      return dest.toString();
    } catch (e) {
      return baseUrl;
    }
  }

  function resolveBaseCheckout() {
    if (global.TRUQUES_CIGANOS_CHECKOUT) return global.TRUQUES_CIGANOS_CHECKOUT;
    if (global.SETE_CHAVES_CHECKOUT) return global.SETE_CHAVES_CHECKOUT;
    if (global.GSP_CHECKOUT) return global.GSP_CHECKOUT;
    if (global.GCD_CHECKOUT) return global.GCD_CHECKOUT;
    if (global.RITA_CHECKOUT) return global.RITA_CHECKOUT;
    if (global.HOTMART_CHECKOUT) return global.HOTMART_CHECKOUT;
    return null;
  }

  function isHotmartUrl(href) {
    return typeof href === 'string' && /pay\.hotmart\.com|hotmart\.com\/|hotm\.art\//i.test(href);
  }

  /** Aplica tracking em .js-checkout e em âncoras Hotmart já com href. */
  function bindCheckoutLinks(selector) {
    var track = captureTracking();
    var base = resolveBaseCheckout();
    var nodes = global.document.querySelectorAll(selector || 'a.js-checkout, a[href*="pay.hotmart.com"], a[href*="hotm.art/"]');

    nodes.forEach(function (el) {
      var href = el.getAttribute('href') || '';
      var target = base;
      if (!target || target === '#checkout') {
        if (isHotmartUrl(href)) target = href;
        else return;
      }
      el.setAttribute('href', buildCheckoutUrl(target, track));
    });
  }

  function init() {
    captureTracking();
    bindCheckoutLinks();
  }

  global.RitaHotmart = {
    captureTracking: captureTracking,
    buildCheckoutUrl: buildCheckoutUrl,
    bindCheckoutLinks: bindCheckoutLinks,
    init: init
  };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
