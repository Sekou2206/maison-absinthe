(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const desk = window.matchMedia("(min-width:901px)").matches;
  const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const year = $(".year");
  if (year) year.textContent = new Date().getFullYear();

  const io = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else v.pause();
  }), { rootMargin: "200px 0px" });
  $$("video[data-lazy]").forEach(v => { v.preload = "metadata"; io.observe(v); });

  const q = $("[data-vapor]");
  if (q) {
    const parts = [];
    q.childNodes.forEach(n => {
      const it = n.nodeType === 1;
      n.textContent.split(/\s+/).filter(Boolean).forEach(w => parts.push(it ? `<em class="w">${w}</em>` : `<span class="w">${w}</span>`));
    });
    q.innerHTML = parts.join(" ");
  }

  const fly = $(".fly");
  if (fly && fine && !reduce) {
    let x = innerWidth / 2, y = innerHeight / 2, fx = x, fy = y, ang = 0, t = 0, idle = 0;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; idle = 0; });
    const loop = () => {
      t += .016; idle += .016;
      const hx = idle > 2 ? Math.sin(t * 2.3) * 14 : 0, hy = idle > 2 ? Math.cos(t * 1.7) * 10 : 0;
      const nx = fx + (x + hx - fx) * .08, ny = fy + (y + hy - fy) * .08;
      const vx = nx - fx, vy = ny - fy;
      if (Math.hypot(vx, vy) > .4) {
        const target = Math.atan2(vy, vx) * 180 / Math.PI + 90;
        let d = target - ang; d = ((d + 540) % 360) - 180; ang += d * .12;
      }
      fx = nx; fy = ny;
      fly.style.transform = `translate(${fx}px,${fy}px) rotate(${ang}deg)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  const veil = $(".veil");
  const setTone = t => { document.body.dataset.tone = t; };
  setTone("nuit");

  if (!hasGsap || reduce) {
    veil.remove();
    $$(".poison__q .w").forEach(w => { w.style.filter = "none"; w.style.opacity = 1; });
    const sections = $$("[data-tone]");
    const tone = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setTone(en.target.dataset.tone); }), { rootMargin: "-50% 0px -50% 0px" });
    sections.forEach(s => tone.observe(s));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-veiled");

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .08, smoothWheel: true });
    lenis.stop();
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.8 }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  const hn = $(".h-n");
  const c = { v: 0 };
  gsap.set(".hero__title span", { yPercent: 0 });
  gsap.timeline({
    onComplete: () => {
      veil.remove();
      document.body.classList.remove("is-veiled");
      lenis && lenis.start();
      ScrollTrigger.refresh();
    }
  })
    .to(".veil__logo", { opacity: 1, duration: 1, ease: "power2.out" })
    .to(c, { v: 99, duration: 1.6, ease: "power2.inOut", onUpdate: () => { hn.textContent = Math.round(c.v); } }, "<")
    .to(".veil", { opacity: 0, duration: 1, ease: "power2.inOut" }, "+=.2")
    .from(".hero__logo", { opacity: 0, scale: .8, duration: 1.4, ease: "expo.out" }, "-=.6")
    .from(".hero__title span", { yPercent: 100, opacity: 0, duration: 1.4, ease: "expo.out", stagger: .12 }, "<.2")
    .from(".hero__motto,.hero__l,.hero__r", { opacity: 0, y: 14, duration: 1, stagger: .1 }, "<.4")
    .to(".hero__vid", { scale: 1, duration: 3, ease: "expo.out" }, 1.4);

  gsap.to(".hero__in", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  $$("[data-tone]").forEach(s => ScrollTrigger.create({
    trigger: s, start: "top 55%", end: "bottom 55%",
    onEnter: () => setTone(s.dataset.tone), onEnterBack: () => setTone(s.dataset.tone)
  }));

  gsap.to(".poison__q .w", { filter: "blur(0px)", opacity: 1, stagger: .08, ease: "none", scrollTrigger: { trigger: ".poison__q", start: "top 82%", end: "bottom 45%", scrub: true } });
  if (desk) {
    gsap.fromTo(".arch--big", { yPercent: 8 }, { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".poison", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".arch--small", { yPercent: 20 }, { yPercent: -20, ease: "none", scrollTrigger: { trigger: ".poison", start: "top bottom", end: "bottom top", scrub: true } });
  }

  const hc = $(".hc");
  const steps = $$(".hours__steps li");
  const hv = { v: 0 };
  ScrollTrigger.create({
    trigger: ".hours__steps", start: "top 60%", end: "bottom 60%",
    onUpdate: s => {
      gsap.set(".hours__bar span", { scaleX: s.progress });
      let target = 0;
      steps.forEach(li => { if (li.getBoundingClientRect().top < innerHeight * .62) target = +li.dataset.h; });
      gsap.to(hv, { v: target, duration: .8, ease: "power2.out", overwrite: true, onUpdate: () => { hc.textContent = Math.round(hv.v); } });
    }
  });
  steps.forEach(li => gsap.from(li.children, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: li, start: "top 85%" } }));

  gsap.from(".matiere__t", { y: 60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".matiere", start: "top 65%" } });
  gsap.from(".matiere__tiles .arch", { clipPath: "inset(100% 0 0 0)", duration: 1.5, ease: "expo.out", stagger: .12, scrollTrigger: { trigger: ".matiere__tiles", start: "top 85%" } });

  gsap.from(".sec__t", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".creations", start: "top 70%" } });
  gsap.from(".name", { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".names", start: "top 85%" } });

  gsap.from(".lib__logo", { opacity: 0, rotate: -20, scale: .7, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".libellule", start: "top 60%" } });
  gsap.from(".lib__txt>*", { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".libellule", start: "top 65%" } });

  gsap.from(".porte__in>*", { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".porte", start: "top 60%" } });
  gsap.from(".foot__fly", { y: 60, x: -80, rotate: -40, opacity: 0, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 90%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
