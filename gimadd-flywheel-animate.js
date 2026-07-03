/**
 * Motor compartido: anillos giratorios, volteo de tarjetas y ciclo de pasos activos.
 * Cada HTML define hubHtml() y opcionalmente iconClassForStep(step).
 */
(function (global) {
  "use strict";

  var VERSIONS = {
    player: {
      desc: "<strong>Jugador</strong>: mejora tu pádel con videoanálisis. Graba, recibe correcciones, entrena con foco y repite.",
      steps: [
        { role: "player", icon: "videocam", title: "Graba en pista", desc: "Partido o sesión de entreno" },
        { role: "player", icon: "send", title: "Envía al coach", desc: "Cola de revisión pendiente" },
        { role: "coach", icon: "rate_review", title: "Analiza el vídeo", desc: "Ves el juego con contexto" },
        { role: "coach", icon: "bookmark", title: "Correcciones clave", desc: "Marcas y notas en momentos exactos" },
        { role: "coach", icon: "flag", title: "Plan de acción", desc: "Objetivos claros para la pista" },
        { role: "player", icon: "auto_stories", title: "Diario", desc: "Entrenas con foco y marcas lo practicado" },
        { role: "both", icon: "check_circle", title: "Metas cumplidas", desc: "Todo el plan completado" }
      ]
    },
    coach: {
      desc: "<strong>Entrenador</strong>: convierte cada vídeo en una sesión de mejora medible con correcciones claras y objetivos accionables.",
      steps: [
        { role: "coach", icon: "storefront", title: "Catálogo y packs", desc: "Pista + vídeo, precios y cupos" },
        { role: "player", icon: "shopping_bag", title: "Contrata servicio", desc: "Pago seguro · cupos activos" },
        { role: "player", icon: "videocam", title: "Graba en pista", desc: "Partido o sesión de entreno" },
        { role: "player", icon: "send", title: "Envía al coach", desc: "Cola de revisión pendiente" },
        { role: "coach", icon: "rate_review", title: "Analiza el vídeo", desc: "Ves el juego con contexto" },
        { role: "coach", icon: "bookmark", title: "Correcciones clave", desc: "Marcas y notas en el timeline" },
        { role: "coach", icon: "flag", title: "Plan de acción", desc: "Objetivos accionables al jugador" },
        { role: "player", icon: "auto_stories", title: "Diario", desc: "Marca objetivos practicados" },
        { role: "both", icon: "check_circle", title: "Metas cumplidas", desc: "Todo el plan completado" }
      ]
    }
  };

  var ROLE_LABEL = {
    coach: "Entrenador",
    player: "Jugador",
    both: "Jugador + coach"
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ringLayersHtml(arcColors) {
    arcColors = arcColors || ["#9a8b3c", "#0F8B4A"];
    return (
      '<div class="flywheel-ring flywheel-ring--outer"></div>' +
      '<div class="flywheel-ring flywheel-ring--mid"></div>' +
      '<div class="flywheel-ring flywheel-ring--pulse"></div>' +
      '<div class="ring-orbit ring-orbit--arcs">' +
      '<svg class="ring-svg ring-svg--arcs" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="46" fill="none" stroke="rgba(10,10,10,0.14)" stroke-width="1.2" stroke-dasharray="3 5"/>' +
      "</svg></div>" +
      '<svg class="flow-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<defs><linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + arcColors[0] + '"/>' +
      '<stop offset="50%" stop-color="#F4D43C"/>' +
      '<stop offset="100%" stop-color="' + arcColors[1] + '"/>' +
      "</linearGradient></defs>" +
      '<circle class="flow-path" cx="50" cy="50" r="44"/></svg>'
    );
  }

  function injectArcSegments(mount, n, arcColors) {
    arcColors = arcColors || ["#9a8b3c", "#0F8B4A"];
    var svg = mount.querySelector(".ring-svg--arcs");
    if (!svg) return;
    var seg = 360 / n;
    var arcs = "";
    for (var i = 0; i < n; i++) {
      var start = i * seg - 90;
      var end = start + seg * 0.68;
      var large = seg > 180 ? 1 : 0;
      var r = 46;
      var rad = function (deg) { return (deg * Math.PI) / 180; };
      var x1 = 50 + r * Math.cos(rad(start));
      var y1 = 50 + r * Math.sin(rad(start));
      var x2 = 50 + r * Math.cos(rad(end));
      var y2 = 50 + r * Math.sin(rad(end));
      var color = arcColors[i % 2];
      arcs +=
        '<path d="M ' + x1 + " " + y1 + " A " + r + " " + r + " 0 " + large + " 1 " + x2 + " " + y2 + '" ' +
        'fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round" opacity="0.92"/>';
    }
    svg.insertAdjacentHTML("beforeend", arcs);
  }

  function stepFlipHtml(step, iconClassFn) {
    var roleClass = "step-role--" + step.role;
    var icoClass = iconClassFn ? iconClassFn(step) : "step-ico--" + step.role;
    return (
      '<button type="button" class="step-flip" aria-label="' + escapeHtml(step.title) + ': pulsa para ver detalle" aria-expanded="false">' +
      '<div class="step-flip-inner">' +
      '<div class="step-card step-card--front">' +
      '<span class="step-role ' + roleClass + '">' + escapeHtml(ROLE_LABEL[step.role] || "") + "</span>" +
      '<div class="step-ico ' + icoClass + '"><span class="material-symbols-rounded">' + escapeHtml(step.icon) + "</span></div>" +
      "<h3>" + escapeHtml(step.title) + "</h3>" +
      '<p class="step-desc-front">' + escapeHtml(step.desc) + "</p></div>" +
      '<div class="step-card step-card--back" aria-hidden="true">' +
      "<p>" + escapeHtml(step.desc) + "</p></div></div></button>"
    );
  }

  function bindStepFlips(mount, onFlipChange) {
    if (mount._flipBound) return;
    mount._flipBound = true;
    mount.addEventListener("click", function (e) {
      var btn = e.target.closest(".step-flip");
      if (!btn) return;
      var inner = btn.querySelector(".step-flip-inner");
      var willFlip = !inner.classList.contains("is-flipped");
      var anyFlipped = false;
      mount.querySelectorAll(".step-flip-inner.is-flipped").forEach(function (el) {
        el.classList.remove("is-flipped");
        el.style.animationPlayState = "";
        var otherBtn = el.closest(".step-flip");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });
      if (willFlip) {
        inner.classList.add("is-flipped");
        inner.style.animationPlayState = "paused";
        btn.setAttribute("aria-expanded", "true");
        anyFlipped = true;
      }
      if (onFlipChange) onFlipChange(anyFlipped);
    });
  }

  function render(mountId, versionKey, opts) {
    opts = opts || {};
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var v = VERSIONS[versionKey];
    var steps = v.steps;
    var n = steps.length;
    var cycleDur = (n * 3.5).toFixed(1) + "s";
    var iconClassFn = opts.iconClassForStep || null;
    var hubHtml = opts.hubHtml || function () { return ""; };
    var onFlipChange = opts.onFlipChange || null;
    var arcColors = opts.arcColors || ["#9a8b3c", "#0F8B4A"];

    mount.setAttribute("data-count", String(n));
    mount.style.setProperty("--cycle-dur", cycleDur);

    var stepsHtml = steps.map(function (step, i) {
      var angle = (360 / n) * i;
      var delay = (i * (parseFloat(cycleDur) / n)).toFixed(2) + "s";
      return (
        '<div class="flywheel-step" style="--angle:' + angle + "deg;--delay:" + delay + ";--cycle-dur:" + cycleDur + '">' +
        stepFlipHtml(step, iconClassFn) +
        '<span class="step-num">' + (i + 1) + "</span></div>"
      );
    }).join("");

    mount._flipBound = false;
    mount.innerHTML = ringLayersHtml(arcColors) + hubHtml() + stepsHtml;
    injectArcSegments(mount, n, arcColors);
    bindStepFlips(mount, onFlipChange);

    mount.setAttribute(
      "aria-label",
      "Flywheel Gimadd Mentor, " + n + " pasos en bucle de mejora continua"
    );

    var descEl = document.getElementById(opts.descElId || "versionDesc");
    if (descEl) descEl.innerHTML = v.desc;

    return v;
  }

  function bindTabs(tabSelector, onSelect) {
    document.querySelectorAll(tabSelector).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-version");
        document.querySelectorAll(tabSelector).forEach(function (b) {
          var isOn = b === btn;
          b.classList.toggle("is-on", isOn);
          b.setAttribute("aria-selected", isOn ? "true" : "false");
        });
        onSelect(key);
      });
    });
  }

  global.GimaddFlywheelAnimate = {
    VERSIONS: VERSIONS,
    ROLE_LABEL: ROLE_LABEL,
    render: render,
    bindTabs: bindTabs
  };
})(window);
