(function(){
  "use strict";
  var D = window.DATA, P = D.PROFILE;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NARROW = function(){ return window.matchMedia && matchMedia("(max-width: 760px)").matches; };

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !RM) {
    try {
      lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      var raf = function(t){ lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch(e) { lenis = null; }
  }
  function goTo(id){
    var el = id === "top" ? document.body : document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(id === "top" ? 0 : el, { offset: -70 });
    else el.scrollIntoView({ behavior: RM ? "auto" : "smooth" });
  }
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    e.preventDefault(); closeMenu(); goTo(id);
  });

  /* ---------- hero ---------- */
  var hl = P.headline;
  var last = hl[2].split(" ");
  var lastWord = last.pop();
  $("#heroTitle").innerHTML =
    '<span class="ln rv">' + esc(hl[0]) + '</span>' +
    '<span class="ln rv" style="--d:.08s">' + esc(hl[1]) + '</span>' +
    '<span class="ln rv" style="--d:.16s">' + esc(last.join(" ")) + ' <em>' + esc(lastWord) + '</em></span>';
  var en = P.nameEn.split(" ");
  $("#giant1").textContent = en[0]; $("#giant2").textContent = en[1] || "";
  $("#years").textContent = P.years;
  $("#role").textContent = P.title;
  $("#roleP").textContent = P.titleKo + " · " + P.majors;
  $("#navName").textContent = P.name;
  $("#markC").textContent = P.initials;

  /* ---------- about ---------- */
  $("#hi").textContent = "안녕하세요, " + P.name + "입니다.";
  $("#sum").innerHTML = (P.aboutText || [P.summary]).map(function(t){ return "<span class=\"para\">" + esc(t) + "</span>"; }).join("");
  $("#facts").innerHTML = P.facts.map(function(f){ return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("");
  $("#pull").textContent = "“" + P.quote + "”";
  $("#idName").textContent = P.name;
  $("#idSub").textContent = P.title + " · " + P.school;
  $("#ini").textContent = P.initials;
  $("#whatI").innerHTML = P.whatIAm.map(function(t){ return "<li>" + esc(t) + "</li>"; }).join("");
  if (P.photo) {
    var im = new Image();
    im.alt = P.name + " 사진";
    im.onload = function(){ var ph = $("#ph"); ph.innerHTML = ""; ph.appendChild(im); };
    im.src = P.photo;
  }
  var idc = $("#idc");
  idc.addEventListener("click", function(){
    var f = idc.classList.toggle("flip");
    idc.setAttribute("aria-pressed", f ? "true" : "false");
  });

  /* pendulum: pointer speed nudges the card, damped spring brings it back */
  (function(){
    var sw = $("#swing"); if (!sw || RM) return;
    var ang = 0, vel = 0, lastX = null, running = false;
    function step(){
      vel += (-0.045 * ang) - 0.06 * vel;
      ang += vel;
      sw.style.transform = "rotate(" + ang.toFixed(3) + "deg)";
      if (Math.abs(ang) < 0.02 && Math.abs(vel) < 0.02) { running = false; sw.style.transform = ""; return; }
      requestAnimationFrame(step);
    }
    window.addEventListener("pointermove", function(e){
      var r = sw.getBoundingClientRect();
      if (e.clientY < r.top - 200 || e.clientY > r.bottom + 120) { lastX = null; return; }
      if (lastX !== null) {
        var dx = e.clientX - lastX;
        vel += Math.max(-1.2, Math.min(1.2, dx * 0.04));
        if (!running) { running = true; requestAnimationFrame(step); }
      }
      lastX = e.clientX;
    }, { passive: true });
  })();

  /* ---------- skills: periodic table ---------- */
  var cats = ["전체"].concat(D.SKILLS.map(function(s){ return s.cat; }).filter(function(c, i, a){ return a.indexOf(c) === i; }));
  var workTitle = {}; D.WORK.forEach(function(w){ workTitle[w.no] = w.short; });
  $("#filters").innerHTML = cats.map(function(c, i){ return '<button type="button" aria-pressed="' + (i === 0) + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
  var pt = $("#ptable");
  pt.innerHTML = D.SKILLS.map(function(s, i){
    var z = String(i + 1).padStart(2, "0");
    var col = i % 8, row = Math.floor(i / 8);
    return '<button type="button" class="el" data-i="' + i + '" style="--i:' + (col + row) + '" aria-label="' + esc(s.n) + ", " + esc(s.cat) + '"><span class="z">' + z + '</span><span class="s">' + esc(s.sym) + '</span><span class="nm">' + esc(s.n) + "</span></button>";
  }).join("");
  function inspect(i){
    var s = D.SKILLS[i];
    $$(".el", pt).forEach(function(e){ e.classList.toggle("on", +e.dataset.i === i); });
    var rel = s.proj.length
      ? s.proj.map(function(p){ return "<li><span>" + p + "</span>" + esc(workTitle[p] || "") + "</li>"; }).join("")
      : '<li><span>—</span>연구·수업에서 사용</li>';
    $("#insp").innerHTML = '<div class="big">' + esc(s.sym) + "</div><h3>" + esc(s.n) + '</h3><div class="cat">' + esc(s.cat) + " · No." + String(i + 1).padStart(2, "0") + "</div><ul>" + rel + "</ul>";
  }
  inspect(0);
  pt.addEventListener("mouseover", function(e){ var b = e.target.closest(".el"); if (b) inspect(+b.dataset.i); });
  pt.addEventListener("focusin", function(e){ var b = e.target.closest(".el"); if (b) inspect(+b.dataset.i); });
  pt.addEventListener("click", function(e){ var b = e.target.closest(".el"); if (b) inspect(+b.dataset.i); });
  $("#filters").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    $$("#filters button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    var c = b.dataset.c;
    $$(".el", pt).forEach(function(el){ el.classList.toggle("dim", c !== "전체" && D.SKILLS[+el.dataset.i].cat !== c); });
  });

  /* ---------- work: spine accordion ---------- */
  var acc = $("#acc");
  acc.innerHTML = D.WORK.map(function(w, i){
    var links = (w.dash ? '<button class="btn" type="button" data-dash="' + esc(w.dash.src) + '" data-t="' + esc(w.dash.title) + '">대시보드 보기 ⤢</button>' : "") +
      w.links.map(function(l){ return '<a class="btn o" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.t) + " ↗</a>"; }).join("");
    return '<article class="pn' + (i === 0 ? " open" : "") + '" data-i="' + i + '">' +
      '<button class="spine" type="button" aria-expanded="' + (i === 0) + '" aria-controls="pb' + i + '"><span class="n">' + w.no + '</span><span class="vt">' + esc(w.short) + "</span><span class=\"n\">+</span></button>" +
      '<div class="pbody" id="pb' + i + '">' +
        '<div class="pinfo"><span class="n">' + w.no + " / 0" + D.WORK.length + "</span><h3>" + esc(w.title) + '</h3><div class="meta">' + esc(w.meta) + '</div><p class="d">' + esc(w.desc) + "</p>" +
        '<ul class="pts">' + w.points.map(function(p){ return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
        '<div class="tools">' + w.tools.map(function(t){ return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</div>" +
        (links ? '<div class="pact">' + links + "</div>" : "") + "</div>" +
        '<figure class="pvis" style="margin:0"><img src="' + esc(w.img) + '" alt="' + esc(w.title + " — " + w.imgLabel) + '" loading="lazy"><figcaption class="tag">' + esc(w.imgLabel) + "</figcaption></figure>" +
      "</div></article>";
  }).join("");
  function openPanel(i){
    $$(".pn", acc).forEach(function(p){
      var on = +p.dataset.i === i;
      p.classList.toggle("open", on);
      $(".spine", p).setAttribute("aria-expanded", on ? "true" : "false");
    });
  }
  acc.addEventListener("click", function(e){
    var s = e.target.closest(".spine"); if (s) openPanel(+s.closest(".pn").dataset.i);
    var d = e.target.closest("[data-dash]"); if (d) openDash(d.dataset.dash, d.dataset.t);
  });
  var hoverT;
  acc.addEventListener("mouseover", function(e){
    if (NARROW() || !window.matchMedia("(hover:hover)").matches) return;
    var p = e.target.closest(".pn"); if (!p || p.classList.contains("open")) return;
    clearTimeout(hoverT); hoverT = setTimeout(function(){ openPanel(+p.dataset.i); }, 160);
  });
  acc.addEventListener("mouseout", function(){ clearTimeout(hoverT); });

  /* dashboard dialog */
  var dm = $("#dm"), dmF = $("#dmF");
  function openDash(src, t){
    $("#dmT").textContent = t; dmF.title = t; $("#dmNew").href = src;
    if (dmF.getAttribute("src") !== src) dmF.setAttribute("src", src);
    if (dm.showModal) dm.showModal(); else window.open(src, "_blank");
  }
  $("#dmX").addEventListener("click", function(){ dm.close(); });
  dm.addEventListener("click", function(e){ if (e.target === dm) dm.close(); });

  /* ---------- career ---------- */
  var tl = $("#tl");
  tl.insertAdjacentHTML("beforeend", D.CAREER.map(function(c){
    return '<div class="ev"><span class="w">' + esc(c.when) + "</span><div><b>" + esc(c.t) + '<span class="k">' + (c.kind === "edu" ? "EDU" : "WORK") + "</span></b>" + (c.d ? "<p>" + esc(c.d) + "</p>" : "") + "</div></div>";
  }).join(""));
  var evs = $$(".ev", tl), tlFill = $("#tlFill");

  /* ---------- achievements ---------- */
  var rail = $("#rail");
  rail.innerHTML = D.ACHIEVEMENTS.map(function(a){
    return '<div class="acard card"><div><div class="t">' + esc(a.t) + '</div><div class="d">' + esc(a.d) + '</div></div><div class="v"><span class="cnt" data-v="' + a.v + '">' + a.v.toLocaleString("ko-KR") + "</span>" + (a.suf ? "<small>" + esc(a.suf) + "</small>" : "") + "</div></div>";
  }).join("") + '<div class="acard card end"><b>and counting →</b></div>';
  $("#awl").innerHTML = D.AWARDS.map(function(a){
    return '<div class="aw"><span class="y">' + esc(a.y) + "</span><b>" + esc(a.t) + '</b><span class="r">' + esc(a.r) + '</span><span class="p">' + esc(a.p) + "</span></div>";
  }).join("");
  var achSec = $("#achievements"), dist = 0;
  function sizeAch(){
    if (NARROW() || RM) { achSec.style.height = ""; rail.style.transform = ""; dist = 0; return; }
    dist = Math.max(0, rail.scrollWidth - window.innerWidth);
    achSec.style.height = (window.innerHeight + dist) + "px";
  }
  function countUp(el){
    if (el.dataset.done) return; el.dataset.done = "1";
    var v = +el.dataset.v;
    if (RM) { el.textContent = v.toLocaleString("ko-KR"); return; }
    var t0 = null;
    function f(t){
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(v * e).toLocaleString("ko-KR");
      if (p < 1) requestAnimationFrame(f);
    }
    el.textContent = "0"; requestAnimationFrame(f);
  }

  /* ---------- contact ---------- */
  var ct = $("#ctT");
  ct.innerHTML = D.CONTACT.title.map(function(row){
    return '<span class="row">' + Array.from(row).map(function(ch){ return ch === " " ? " " : '<span class="ch">' + esc(ch) + "</span>"; }).join("") + "</span>";
  }).join("");
  ct.setAttribute("aria-label", D.CONTACT.title.join(" "));
  ct.addEventListener("mouseover", function(e){
    var c = e.target.closest(".ch"); if (!c || RM) return;
    c.classList.add("pop"); setTimeout(function(){ c.classList.remove("pop"); }, 420);
  });
  $("#cnote").textContent = D.CONTACT.note;
  var mailA = $("#mailA"); mailA.textContent = P.email; mailA.href = "mailto:" + P.email;
  var cb = $("#copyBtn");
  cb.addEventListener("click", function(){
    var ok = function(){ cb.textContent = "복사됨 ✓"; setTimeout(function(){ cb.textContent = "복사"; }, 1600); };
    var fb = function(){ var r = document.createRange(); r.selectNodeContents(mailA); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cb.textContent = "선택됨"; setTimeout(function(){ cb.textContent = "복사"; }, 1600); };
    try { navigator.clipboard.writeText(P.email).then(ok, fb); } catch(e) { fb(); }
  });
  $("#copy").textContent = "© " + new Date().getFullYear() + " " + P.name + " · " + P.nameEn;
  $("#src").textContent = D.CONTACT.sources;

  /* ---------- nav ---------- */
  var menu = $("#menu"), ind = $("#ind");
  menu.insertAdjacentHTML("beforeend", D.NAV.map(function(n){ return '<a href="#' + n.id + '" data-id="' + n.id + '">' + esc(n.label) + "</a>"; }).join(""));
  $("#mList").innerHTML = D.NAV.map(function(n){ return '<li><a href="#' + n.id + '">' + esc(n.label) + "</a></li>"; }).join("");
  var mm = $("#mMenu"), mb = $("#mBtn");
  function closeMenu(){ if (!mm.hidden) { mm.hidden = true; mb.setAttribute("aria-expanded", "false"); mb.focus(); } }
  mb.addEventListener("click", function(){ mm.hidden = false; mb.setAttribute("aria-expanded", "true"); $("#mClose").focus(); });
  $("#mClose").addEventListener("click", closeMenu);
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });
  $("#fsBtn").addEventListener("click", function(){
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else { var p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(function(){}); }
    } catch(e) {}
  });
  var cur = null;
  function setCur(id){
    if (id === cur) return; cur = id;
    var a = null;
    $$("a", menu).forEach(function(x){ var on = x.dataset.id === id; x.setAttribute("aria-current", on ? "true" : "false"); if (on) a = x; });
    if (a) { ind.style.opacity = "1"; ind.style.width = a.offsetWidth + "px"; ind.style.transform = "translateX(" + a.offsetLeft + "px)"; }
    else ind.style.opacity = "0";
  }

  /* ---------- scroll loop ---------- */
  var nav = $("#nav"), prog = $("#prog");
  var secIds = D.NAV.map(function(n){ return n.id; });
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? y / h : 0).toFixed(4) + ")";
    nav.classList.toggle("scrolled", y > 40);
    var mid = window.innerHeight * 0.35, id = null;
    secIds.forEach(function(s){ var el = document.getElementById(s); if (el && el.getBoundingClientRect().top <= mid) id = s; });
    setCur(id);
    // career line
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
    tlFill.style.height = (p * (r.height - 12)) + "px";
    evs.forEach(function(ev){ ev.classList.toggle("lit", ev.getBoundingClientRect().top < vh * 0.7); });
    // achievements
    if (dist > 0) {
      var ar = achSec.getBoundingClientRect();
      var ap = Math.max(0, Math.min(1, -ar.top / dist));
      rail.style.transform = "translate3d(" + (-ap * dist).toFixed(1) + "px,0,0)";
      var cx = window.innerWidth / 2, best = null, bd = 1e9;
      $$(".acard", rail).forEach(function(c){ var b = c.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - cx); if (d < bd) { bd = d; best = c; } });
      $$(".acard", rail).forEach(function(c){ c.classList.toggle("mid", c === best); });
    }
    $$(".cnt", rail).forEach(function(c){ var b = c.getBoundingClientRect(); if (b.left < window.innerWidth && b.right > 0 && b.top < window.innerHeight && b.bottom > 0) countUp(c); });
  }
  if (lenis) lenis.on("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function(){ sizeAch(); onScroll(); });
  if (rail.scrollLeft !== undefined) rail.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- reveal ---------- */
  var targets = $$(".rv").concat([pt]);
  if ("IntersectionObserver" in window && !RM) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function(t){ io.observe(t); });
  } else targets.forEach(function(t){ t.classList.add("in"); });

  sizeAch(); onScroll();
  window.addEventListener("load", function(){ sizeAch(); onScroll(); });
})();
