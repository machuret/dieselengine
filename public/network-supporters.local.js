/* YouSail network supporters. Shared cached data, fair rotation and pausable motion. */
(() => {
  "use strict";
  if (!window.customElements || customElements.get("yousail-supporters")) return;
  const localFeatures = {"b24859a7-962f-4cb4-b672-2f6df2dfb9c8": "boateye360", "7748bb5b-c629-440d-add3-fc529208acd6": "captain-matt", "e5fa1470-b4f1-439f-acef-4769393297a6": "easy-inflatables", "1d81e8a0-07db-487d-8c15-4d538e3ec96d": "ferosticker", "27333a09-a950-4eff-a6ed-9b9c3ffa4544": "flying-fish-sailing", "bb2002c8-1695-41ca-8a48-3c34e8dc7aa6": "honu", "c0f62604-3a7f-46db-920d-adebe41e6915": "mainstay-sailing", "3ed4bde9-5da8-4314-a778-09a54ea09563": "shakesure", "5869f49c-4e9d-4d5f-a531-f3214b5abc34": "sos-marine", "c82286b4-e77e-49b7-963b-c0b97ecaf71b": "survival-kit", "0d2854f5-2741-40dd-9c61-1fec3355a923": "water-makers-australia"};
  const feeds = new Map();
  let settings;
  function carouselEnabled(site) {
    if (!settings) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      settings = fetch("https://yousail.com.au/api/network-sponsors/config", { credentials: "omit", signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Carousel settings unavailable");
          const body = await response.json();
          if (body.version !== 1 || !Array.isArray(body.disabledSites)) throw new Error("Unsupported settings");
          return body.disabledSites;
        }).catch((error) => { settings = undefined; throw error; }).finally(() => clearTimeout(timeout));
    }
    return settings.then((disabled) => !disabled.includes(site));
  }
  function feed(site) {
    if (!feeds.has(site)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const request = fetch(`https://yousail.com.au/api/network-sponsors/${encodeURIComponent(site)}`, {
        credentials: "omit", signal: controller.signal,
      }).then(async (response) => {
        if (!response.ok) throw new Error("Supporters unavailable");
        const body = await response.json();
        if (body.version !== 1 || !Array.isArray(body.sponsors)) throw new Error("Unsupported feed");
        return body.sponsors;
      }).catch((error) => { feeds.delete(site); throw error; }).finally(() => clearTimeout(timeout));
      feeds.set(site, request);
    }
    return feeds.get(site);
  }
  const css = `
    :host{display:block;width:100%;font:inherit;color:inherit}*{box-sizing:border-box}
    section{max-width:1200px;margin:0 auto;padding:32px 20px}h2{font:inherit;font-size:1.6rem;font-weight:700;margin:0}
    .heading{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:24px}
    .heading a{color:inherit;text-decoration:underline;text-underline-offset:4px;min-height:44px;display:inline-flex;align-items:center}
    ul{list-style:none;padding:0;margin:0;gap:20px}li{list-style:none;margin:0;padding:0;min-width:0}
    .marquee{display:flex;overflow-x:auto;scrollbar-width:none;padding:4px 0 12px}.marquee::-webkit-scrollbar{display:none}.carousel{display:flex;flex:0 0 auto;min-width:100%;justify-content:space-around;padding-right:20px}.carousel li{flex:0 0 min(220px,80vw)}
    .moving .carousel{animation:sponsor-scroll var(--sponsor-duration,40s) linear infinite}.marquee:hover .carousel,.marquee:focus-within .carousel{animation-play-state:paused}
    @keyframes sponsor-scroll{to{transform:translateX(-100%)}}
    @media(prefers-reduced-motion:reduce){.moving .carousel{animation:none}.copy{display:none}}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))}
    .logo{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:16px;padding:20px;border:1px solid #cad2d9;border-radius:8px;background:#fff;color:#162c40;text-align:center;text-decoration:none;font-weight:600}
    img{display:block;flex-shrink:0;width:100%;max-width:240px;height:100px;object-fit:contain}
    a:focus-visible,.marquee:focus-visible{outline:3px solid #1475a8;outline-offset:4px}
    p{line-height:1.6;margin:0}
  `;
  function element(tag, text) { const node = document.createElement(tag); if (text) node.textContent = text; return node; }
  function webUrl(value) {
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
    catch { return null; }
  }
  customElements.define("yousail-supporters", class extends HTMLElement {
    connectedCallback() {
      if (this.renderToken) return;
      const site = this.getAttribute("site");
      if (!site || !/^[a-z]{1,64}$/.test(site)) return;
      const carousel = this.getAttribute("mode") !== "grid";
      const token = {}; this.renderToken = token;
      // Keep the framework-owned custom element in place. Its presentation
      // gets a separate mount beneath the homepage introduction, cleaned up
      // when navigation removes the custom element.
      const main = carousel && /^\/(?:index\.html)?$/.test(location.pathname) ? document.querySelector("main") : null;
      let mount;
      if (main) {
        mount = element("div"); mount.setAttribute("data-network-supporters-placement", site);
        let intro = main.querySelector("h1")?.closest("section, header, .hero");
        // Top Charters' search panel overlaps its hero; keep that opening
        // unit together rather than inserting between the photo and search.
        const search = site === "topcharters" ? main.querySelector(".search")?.closest(".wrap") : null;
        if (search && intro?.nextElementSibling === search) intro = search;
        if (intro && main.contains(intro) && intro !== main) intro.after(mount);
        else main.prepend(mount);
        this.presentation = mount;
      }
      const root = mount ? mount.attachShadow({ mode: "open" }) : this.shadowRoot || this.attachShadow({ mode: "open" });
      root.replaceChildren(element("style", css));
      (carousel ? carouselEnabled(site).then((enabled) => enabled ? feed(site) : []) : feed(site)).then((sponsors) => {
        if (!this.isConnected || this.renderToken !== token) return;
        if (!sponsors.length && carousel) return;
        const section = element("section"); section.setAttribute("aria-label", "Supporters");
        if (carousel) {
          const heading = element("div"); heading.className = "heading";
          const link = element("a", "Meet our supporters →"); link.href = "/supporters/";
          heading.append(element("h2", "Our supporters"), link); section.append(heading);
        }
        if (!sponsors.length) { section.append(element("p", "Our supporters will appear here soon.")); root.append(section); return; }
        const list = element("ul"); list.className = carousel ? "carousel" : "grid";
        list.setAttribute("aria-label", "Sponsor logos");
        const order = [...sponsors];
        if (carousel) for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]];
        }
        for (let sponsor of order) {
          if (localFeatures[sponsor.id] === "survival-kit") sponsor = { ...sponsor, name: "SURVIVAL" };
          const target = webUrl(sponsor.targetUrl); const logoUrl = webUrl(sponsor.logoUrl);
          if (!target || !logoUrl || typeof sponsor.name !== "string") continue;
          const item = element("li"); const link = element("a"); link.className = "logo";
          const slug = localFeatures[sponsor.id];
          link.href = slug ? `/supporters/${slug}/` : target;
          if (!slug) { link.target = "_blank"; link.rel = "sponsored nofollow noopener noreferrer"; }
          link.setAttribute("aria-label", slug ? `Read our ${sponsor.name} feature` : `${sponsor.name} (opens in a new tab)`);
          const image = element("img"); image.src = logoUrl; image.alt = `${sponsor.name} logo`;
          image.width = 240; image.height = 120; image.loading = "lazy"; image.decoding = "async";
          link.append(image, element("span", sponsor.name)); item.append(link); list.append(item);
        }
        const viewport = carousel ? element("div") : section;
        if (carousel) { viewport.className = "marquee"; viewport.tabIndex = 0; viewport.setAttribute("aria-label", "Scrolling sponsor logos"); section.append(viewport); }
        viewport.append(list);
        if (carousel && list.children.length > 1) {
          viewport.classList.add("moving");
          const copy = list.cloneNode(true); copy.classList.add("copy"); copy.removeAttribute("aria-label"); copy.setAttribute("aria-hidden", "true");
          copy.querySelectorAll("a").forEach((link) => { link.tabIndex = -1; }); viewport.append(copy);
        }
        root.append(section);
        if (carousel && list.children.length > 1) {
          const measure = () => viewport.style.setProperty("--sponsor-duration", `${Math.max(20, list.scrollWidth / 25)}s`);
          this.observer = new ResizeObserver(measure); this.observer.observe(viewport); measure();
        }
      }).catch(() => {
        if (!this.isConnected || this.renderToken !== token) return;
        if (!carousel) { const section = element("section"); const message = element("p", "Supporters are temporarily unavailable. Please try again later."); message.setAttribute("role", "status"); section.append(message); root.append(section); }
      });
    }
    disconnectedCallback() {
      this.renderToken = null;
      this.observer?.disconnect();
      this.presentation?.remove(); this.presentation = null;
    }
  });
})();
