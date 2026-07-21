// AKVARYUM — mobile main-flow guard

(function attachMobileFlowGuard(global) {
  'use strict';

  const STYLE_ID = 'akvaryum-mobile-flow-guard';
  const MOBILE_BREAKPOINT_PX = 640;
  const SMOKE_WIDTH_PX = 360;

  const CSS = `
    *,*::before,*::after{box-sizing:border-box}
    html,body,#root,.app{max-width:100%;min-width:0}
    img,svg,video,canvas{max-width:100%;height:auto}
    table{max-width:100%}
    @media(max-width:${MOBILE_BREAKPOINT_PX}px){
      html,body{width:100%;overflow-x:clip!important}
      #root,.app,.stage,.stage>*,main,section,article,aside,header,footer{min-width:0!important;max-width:100%!important}
      .stage{width:100%!important;padding-left:10px!important;padding-right:10px!important}
      .topbar,.topbar-inner,.topbar-content,.nav,.navbar{max-width:100%!important;min-width:0!important}
      .topbar-inner,.topbar-content,.nav,.navbar{padding-left:10px!important;padding-right:10px!important;gap:8px!important}
      .brand,.logo,.topbar-title{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      .recipe-strip,.recipe-row,.recipe-items,.progress,.progress-wrap{min-width:0!important;max-width:100%!important}
      .recipe-strip,.recipe-row,.recipe-items{overflow-x:auto!important;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch}
      .grid,.cards,.card-grid,.option-grid,.result-grid,.plant-grid,.substrate-grid,.tank-grid,.water-grid{grid-template-columns:minmax(0,1fr)!important}
      .card,.option-card,.result-card,.panel{min-width:0!important;max-width:100%!important}
      input,select,textarea,button{max-width:100%}
      input,select,textarea{font-size:16px!important}
      pre,code{max-width:100%;overflow-x:auto}
      table{display:block;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .foot-nav{left:0!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:7px!important;padding:9px max(10px,env(safe-area-inset-right)) calc(9px + env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))!important}
      .foot-nav>.btn,.foot-nav button{min-width:0!important;padding:10px 11px!important;font-size:12px!important;white-space:normal!important}
      .foot-nav .progress,.foot-nav [class*=progress]{min-width:0!important;overflow:hidden!important}
      .catalog-step{width:min(100% - 16px,1180px)!important}
      .catalog-toolbar{max-width:100%!important}
      .catalog-search-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
      .catalog-search{grid-column:1/-1!important}
      .catalog-card-action{gap:8px!important;flex-wrap:wrap!important}
      .catalog-detail{margin-right:auto!important}
      .inhabitant-detail-panel{width:100%!important;max-width:100%!important}
      .inhabitant-detail-actions{left:0!important;right:0!important;width:100%!important;padding-bottom:calc(12px + env(safe-area-inset-bottom))!important}
    }
    @media(max-width:420px){
      .foot-nav{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
      .foot-nav .progress,.foot-nav [class*=progress]{grid-column:1/-1!important;grid-row:1!important;order:-1!important}
      .foot-nav>.btn,.foot-nav>button{width:100%!important}
      .catalog-filter-toggle,.catalog-reset{width:100%!important}
    }
    @supports not (overflow:clip){
      @media(max-width:${MOBILE_BREAKPOINT_PX}px){html,body{overflow-x:hidden!important}}
    }
  `;

  function installStyles(documentRef = global.document) {
    if (!documentRef?.head || documentRef.getElementById(STYLE_ID)) return false;
    const style = documentRef.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    documentRef.head.append(style);
    return true;
  }

  function elementLabel(element) {
    if (!element) return 'unknown';
    const tag = String(element.tagName || 'element').toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = typeof element.className === 'string'
      ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((value) => `.${value}`).join('')
      : '';
    return `${tag}${id}${classes}`;
  }

  function audit(root = global.document?.documentElement, viewportWidth = null) {
    if (!root) return { viewportWidth: 0, hasOverflow: false, overflowPx: 0, offenders: [] };
    const width = Number(viewportWidth || root.clientWidth || global.innerWidth || 0);
    const rootOverflow = Math.max(0, Number(root.scrollWidth || 0) - width);
    const offenders = [];
    const elements = typeof root.querySelectorAll === 'function' ? root.querySelectorAll('*') : [];

    for (const element of elements) {
      if (typeof element.getBoundingClientRect !== 'function') continue;
      const rect = element.getBoundingClientRect();
      const rightOverflow = Math.max(0, Number(rect.right || 0) - width);
      const leftOverflow = Math.max(0, -Number(rect.left || 0));
      const scrollOverflow = Math.max(0, Number(element.scrollWidth || 0) - Number(element.clientWidth || 0));
      const overflowPx = Math.max(rightOverflow, leftOverflow, scrollOverflow);
      if (overflowPx > 1) offenders.push({ element: elementLabel(element), overflowPx: Math.round(overflowPx) });
      if (offenders.length >= 20) break;
    }

    return {
      viewportWidth: width,
      hasOverflow: rootOverflow > 1 || offenders.length > 0,
      overflowPx: Math.round(rootOverflow),
      offenders,
    };
  }

  function publishAudit() {
    if (!global.document || Number(global.innerWidth || 0) > MOBILE_BREAKPOINT_PX) return;
    const report = audit(global.document.documentElement);
    global.document.documentElement.dataset.mobileOverflow = report.hasOverflow ? 'true' : 'false';
    global.__AKVARYUM_MOBILE_AUDIT__ = report;
    if (report.hasOverflow && global.console?.warn) {
      global.console.warn('AKVARYUM mobil taşma denetimi', report);
    }
  }

  installStyles();
  if (typeof global.addEventListener === 'function') {
    global.addEventListener('load', publishAudit, { once: true });
    global.addEventListener('resize', publishAudit);
  }

  global.MobileFlowGuard = Object.freeze({
    version: 1,
    mobileBreakpointPx: MOBILE_BREAKPOINT_PX,
    smokeWidthPx: SMOKE_WIDTH_PX,
    installStyles,
    audit,
  });
})(window);
