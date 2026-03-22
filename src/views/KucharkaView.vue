<template>
  <div class="kucharka-page">

    <!-- HEADER -->
    <header class="app-header">
      <div class="app-header__inner">
        <button class="app-header__back" @click="router.back()" aria-label="Zpět">‹</button>
        <span class="app-header__title">🧑‍🍳 Soustružnická kuchařka</span>
      </div>
    </header>

    <!-- TABS -->
    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-btn__icon">{{ tab.icon }}</span>
        <span class="tab-btn__label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- OBSAH -->
    <main class="page-content">
      <div class="container-wide">

        <!-- ==================== NOŽE ==================== -->
        <section v-if="activeTab === 'noze'">
          <h2 class="section-heading">Soustružnické nože</h2>

          <div class="tool-grid">
            <div v-for="tool in tools" :key="tool.name" class="tool-card">
              <div class="tool-card__header">
                <span class="tool-card__icon">{{ tool.icon }}</span>
                <span class="tool-card__name">{{ tool.name }}</span>
              </div>
              <p class="tool-card__desc">{{ tool.desc }}</p>
              <div class="tool-card__params">
                <div v-for="p in tool.params" :key="p.k" class="param-row">
                  <span class="param-row__key">{{ p.k }}</span>
                  <span class="param-row__val">{{ p.v }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==================== ZÁVITY ==================== -->
        <section v-if="activeTab === 'zavity'">
          <h2 class="section-heading">Metrické závity – ISO 724</h2>
          <p class="section-note">Hodnoty dle ČSN EN ISO 724 • rozměry v mm</p>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Závit</th>
                  <th>Rozteč<br /><small>p [mm]</small></th>
                  <th>Střední Ø<br /><small>d₂ [mm]</small></th>
                  <th>Malý Ø<br /><small>d₁ [mm]</small></th>
                  <th>Vrták<br /><small>[mm]</small></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in threads" :key="t.d" :class="{ 'tr-highlight': t.hi }">
                  <td class="td-name">{{ t.d }}</td>
                  <td>{{ t.p }}</td>
                  <td>{{ t.d2 }}</td>
                  <td>{{ t.d1 }}</td>
                  <td class="td-drill">{{ t.dr }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="info-box" style="margin-top:20px">
            <div class="info-box__title">💡 Výpočet průměru vrtáku</div>
            <div class="info-box__text">
              Vrták = jmenovitý průměr − rozteč<br />
              <code>d<sub>vrták</sub> = D − p</code><br />
              Příklad: M10×1,5 → vrták = 10 − 1,5 = <strong>8,5 mm</strong>
            </div>
          </div>
        </section>

        <!-- ==================== DRSNOST ==================== -->
        <section v-if="activeTab === 'drsnost'">
          <h2 class="section-heading">Drsnost povrchu Ra</h2>
          <p class="section-note">Střední aritmetická úchylka profilu • dle ČSN EN ISO 4287</p>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Třída</th>
                  <th>Ra [µm]</th>
                  <th>Rz [µm]</th>
                  <th>Metoda obrábění</th>
                  <th>Použití</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in roughness" :key="r.cls">
                  <td class="td-name">{{ r.cls }}</td>
                  <td>
                    <span class="ra-chip" :style="{ background: r.color + '22', color: r.color, borderColor: r.color + '55' }">
                      {{ r.ra }}
                    </span>
                  </td>
                  <td>{{ r.rz }}</td>
                  <td>{{ r.method }}</td>
                  <td class="td-usage">{{ r.usage }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Značení na výkrese -->
          <h3 class="subsection-heading">Značení drsnosti na výkrese</h3>
          <div class="symbol-cards">
            <div class="symbol-card" v-for="s in raSymbols" :key="s.symbol">
              <div class="symbol-card__sym">{{ s.symbol }}</div>
              <div class="symbol-card__desc">{{ s.desc }}</div>
            </div>
          </div>
        </section>

        <!-- ==================== VÝKRES ==================== -->
        <section v-if="activeTab === 'vykres'">
          <h2 class="section-heading">Výkresové vysvětlivky</h2>

          <!-- Geometrické tolerance -->
          <h3 class="subsection-heading">Geometrické tolerance (GD&T)</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Značka</th>
                  <th>Název</th>
                  <th>Skupina</th>
                  <th>Popis</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="g in gdtSymbols" :key="g.sym">
                  <td class="td-sym">{{ g.sym }}</td>
                  <td class="td-name">{{ g.name }}</td>
                  <td><span class="badge-group" :class="'badge-' + g.group">{{ g.groupName }}</span></td>
                  <td class="td-usage">{{ g.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Zkratky na výkresech -->
          <h3 class="subsection-heading">Časté zkratky a značky</h3>
          <div class="abbr-grid">
            <div v-for="a in abbreviations" :key="a.sym" class="abbr-card">
              <span class="abbr-card__sym">{{ a.sym }}</span>
              <span class="abbr-card__name">{{ a.name }}</span>
            </div>
          </div>

          <!-- Tolerance ISO 2768 -->
          <h3 class="subsection-heading">Všeobecné tolerance ISO 2768</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Třída</th>
                  <th>Označení</th>
                  <th>Délkové úchylky</th>
                  <th>Úhlové úchylky</th>
                  <th>Použití</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="iso in iso2768" :key="iso.cls">
                  <td class="td-name">{{ iso.cls }}</td>
                  <td><strong>{{ iso.code }}</strong></td>
                  <td>{{ iso.length }}</td>
                  <td>{{ iso.angle }}</td>
                  <td class="td-usage">{{ iso.usage }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Uložení a tolerance (soustavy) -->
          <h3 class="subsection-heading">Soustava uložení – příklady</h3>
          <div class="fits-grid">
            <div v-for="f in fits" :key="f.fit" class="fit-card">
              <div class="fit-card__fit">{{ f.fit }}</div>
              <div class="fit-card__type">{{ f.type }}</div>
              <div class="fit-card__desc">{{ f.desc }}</div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tabs = [
  { id: 'noze',    icon: '🔧', label: 'Nože'    },
  { id: 'zavity',  icon: '🔩', label: 'Závity'  },
  { id: 'drsnost', icon: '〰', label: 'Ra'      },
  { id: 'vykres',  icon: '📐', label: 'Výkres'  },
]
const activeTab = ref('noze')

/* ---- NOŽE ---- */
const tools = [
  {
    icon: '↗', name: 'Ubírací nůž – hrubování',
    desc: 'Odebírá velké množství materiálu. Robustní průřez, velký úhel čela.',
    params: [
      { k: 'Posuv f',     v: '0,2 – 0,8 mm/ot' },
      { k: 'Hloubka ap',  v: '2 – 8 mm' },
      { k: 'Geometrie',   v: 'κr = 45–90°, γ = 6–10°' },
    ],
  },
  {
    icon: '→', name: 'Ubírací nůž – načisto',
    desc: 'Dokončovací soustružení na míru. Menší posuv, hladší povrch.',
    params: [
      { k: 'Posuv f',     v: '0,05 – 0,2 mm/ot' },
      { k: 'Hloubka ap',  v: '0,1 – 1 mm' },
      { k: 'Geometrie',   v: 'κr = 45–75°, γ = 10–15°' },
    ],
  },
  {
    icon: '↙', name: 'Rohový nůž (čelní)',
    desc: 'Zarovnává čela, soustružení osazení a kolmých ploch.',
    params: [
      { k: 'Posuv f',     v: '0,1 – 0,4 mm/ot' },
      { k: 'Hloubka ap',  v: '0,5 – 4 mm' },
      { k: 'Geometrie',   v: 'κr = 90°, rohový nůž' },
    ],
  },
  {
    icon: '⊥', name: 'Upichovací / zapichovací nůž',
    desc: 'Upichování obrobku, zapichování drážek a osazení.',
    params: [
      { k: 'Posuv f',     v: '0,03 – 0,12 mm/ot' },
      { k: 'Šířka nože',  v: '2 – 6 mm' },
      { k: 'Chlazení',    v: 'nutné, hrozí vibrace' },
    ],
  },
  {
    icon: '≈', name: 'Závitový nůž',
    desc: 'Řezání vnějších i vnitřních závitů na soustruhu. Profil 60° (metrický).',
    params: [
      { k: 'Počet záběrů', v: '5–15 (dle materiálu)' },
      { k: 'Záběr',        v: '0,05 – 0,3 mm/záběr' },
      { k: 'Profil',       v: '60° ISO metrický' },
    ],
  },
  {
    icon: '⟲', name: 'Vnitřní nůž (vývrtek)',
    desc: 'Soustružení vnitřních průměrů a otvorů. Vysoké riziko vibrací.',
    params: [
      { k: 'Posuv f',     v: '0,05 – 0,2 mm/ot' },
      { k: 'Hloubka ap',  v: '0,3 – 2 mm' },
      { k: 'Dosah',       v: 'max 4× průměr tyče' },
    ],
  },
  {
    icon: '⌒', name: 'Kopírovací (profilový) nůž',
    desc: 'Tvarové soustružení, rádiusy, kužely. Malý poloměr špičky.',
    params: [
      { k: 'Posuv f',     v: '0,05 – 0,15 mm/ot' },
      { k: 'Rε špičky',   v: '0,2 – 0,8 mm' },
      { k: 'Geometrie',   v: 'malý úhel nastavení' },
    ],
  },
  {
    icon: '▷', name: 'Vydutý / vypuklý tvarový nůž',
    desc: 'Výroba standardních tvarů (radiusy, drážky) v jediném záběru.',
    params: [
      { k: 'Posuv f',     v: '0,02 – 0,08 mm/ot' },
      { k: 'Šířka řezu',  v: 'dle tvaru' },
      { k: 'Chlazení',    v: 'doporučeno' },
    ],
  },
]

/* ---- ZÁVITY ---- */
const threads = [
  { d:'M1',   p:'0,25', d2:'0,838', d1:'0,693', dr:'0,75' },
  { d:'M1,2', p:'0,25', d2:'1,038', d1:'0,893', dr:'0,95' },
  { d:'M1,4', p:'0,3',  d2:'1,205', d1:'1,032', dr:'1,1'  },
  { d:'M1,6', p:'0,35', d2:'1,373', d1:'1,171', dr:'1,25' },
  { d:'M2',   p:'0,4',  d2:'1,740', d1:'1,509', dr:'1,6'  },
  { d:'M2,5', p:'0,45', d2:'2,208', d1:'1,948', dr:'2,05' },
  { d:'M3',   p:'0,5',  d2:'2,675', d1:'2,387', dr:'2,5',  hi:true },
  { d:'M4',   p:'0,7',  d2:'3,545', d1:'3,141', dr:'3,3',  hi:true },
  { d:'M5',   p:'0,8',  d2:'4,480', d1:'4,019', dr:'4,2',  hi:true },
  { d:'M6',   p:'1,0',  d2:'5,350', d1:'4,917', dr:'5,0',  hi:true },
  { d:'M8',   p:'1,25', d2:'7,188', d1:'6,647', dr:'6,8',  hi:true },
  { d:'M10',  p:'1,5',  d2:'9,026', d1:'8,376', dr:'8,5',  hi:true },
  { d:'M12',  p:'1,75', d2:'10,863',d1:'10,106',dr:'10,2', hi:true },
  { d:'M14',  p:'2,0',  d2:'12,701',d1:'11,835',dr:'12,0' },
  { d:'M16',  p:'2,0',  d2:'14,701',d1:'13,835',dr:'14,0', hi:true },
  { d:'M18',  p:'2,5',  d2:'16,376',d1:'15,294',dr:'15,5' },
  { d:'M20',  p:'2,5',  d2:'18,376',d1:'17,294',dr:'17,5', hi:true },
  { d:'M22',  p:'2,5',  d2:'20,376',d1:'19,294',dr:'19,5' },
  { d:'M24',  p:'3,0',  d2:'22,051',d1:'20,752',dr:'21,0', hi:true },
  { d:'M27',  p:'3,0',  d2:'25,051',d1:'23,752',dr:'24,0' },
  { d:'M30',  p:'3,5',  d2:'27,727',d1:'26,211',dr:'26,5', hi:true },
  { d:'M33',  p:'3,5',  d2:'30,727',d1:'29,211',dr:'29,5' },
  { d:'M36',  p:'4,0',  d2:'33,402',d1:'31,670',dr:'32,0', hi:true },
  { d:'M39',  p:'4,0',  d2:'36,402',d1:'34,670',dr:'35,0' },
  { d:'M42',  p:'4,5',  d2:'39,077',d1:'37,129',dr:'37,5' },
  { d:'M45',  p:'4,5',  d2:'42,077',d1:'40,129',dr:'40,5' },
  { d:'M48',  p:'5,0',  d2:'44,752',d1:'42,587',dr:'43,0', hi:true },
  { d:'M52',  p:'5,0',  d2:'48,752',d1:'46,587',dr:'47,0' },
  { d:'M56',  p:'5,5',  d2:'52,428',d1:'50,046',dr:'50,5' },
  { d:'M60',  p:'5,5',  d2:'56,428',d1:'54,046',dr:'54,5' },
  { d:'M64',  p:'6,0',  d2:'60,103',d1:'57,505',dr:'58,0', hi:true },
]

/* ---- DRSNOST ---- */
const roughness = [
  { cls:'N1',  ra:'0,1',  rz:'0,5',  color:'#7c3aed', method:'Superfinishing, leštění', usage:'Ložisková sedla, optika' },
  { cls:'N2',  ra:'0,2',  rz:'1,0',  color:'#7c3aed', method:'Jemné leštění, honování', usage:'Přesná ložiska, píst' },
  { cls:'N3',  ra:'0,4',  rz:'2,0',  color:'#2563eb', method:'Honování, jemné broušení', usage:'Válce, vnitřní průměry' },
  { cls:'N4',  ra:'0,8',  rz:'4,0',  color:'#2563eb', method:'Jemné broušení, diamant. soustr.', usage:'Těsnicí plochy, vodítka' },
  { cls:'N5',  ra:'1,6',  rz:'8,0',  color:'#059669', method:'Broušení, jemné soustružení', usage:'Funkční plochy, spojení' },
  { cls:'N6',  ra:'3,2',  rz:'16',   color:'#059669', method:'Jemné soustružení, frézování', usage:'Obvyklé obrábění načisto' },
  { cls:'N7',  ra:'6,3',  rz:'32',   color:'#d97706', method:'Soustružení, frézování', usage:'Méně důležité plochy' },
  { cls:'N8',  ra:'12,5', rz:'63',   color:'#d97706', method:'Hrubé soustružení', usage:'Hrubování, povrch odlitků' },
  { cls:'N9',  ra:'25',   rz:'125',  color:'#dc2626', method:'Hrubé obrábění, tvarování', usage:'Skryté plochy, hrubovky' },
  { cls:'N10', ra:'50',   rz:'250',  color:'#dc2626', method:'Opracování za tepla, lití', usage:'Neobrobené plochy' },
]

const raSymbols = [
  { symbol: '✓',    desc: 'Základní značka – odebrání materiálu libovolnou metodou' },
  { symbol: '✓̄',   desc: 'Odebrání materiálu nutné (soustružení, frézování…)' },
  { symbol: '○',    desc: 'Odebrání materiálu zakázáno (odlévání, kování…)' },
  { symbol: 'Ra',   desc: 'Střední aritmetická úchylka profilu' },
  { symbol: 'Rz',   desc: 'Výška nerovností profilu (10 bodů)' },
  { symbol: 'Rmax', desc: 'Největší výška nerovností' },
]

/* ---- GD&T ---- */
const gdtSymbols = [
  { sym:'—',  name:'Přímočarost',        group:'tvar',   groupName:'Tvar',    desc:'Odchylka od přímé linie' },
  { sym:'□',  name:'Rovinnost',          group:'tvar',   groupName:'Tvar',    desc:'Odchylka od ideální roviny' },
  { sym:'○',  name:'Kruhovitost',        group:'tvar',   groupName:'Tvar',    desc:'Odchylka od ideální kružnice' },
  { sym:'⌭',  name:'Válcovitost',        group:'tvar',   groupName:'Tvar',    desc:'Kruhovitost + přímočarost osy' },
  { sym:'⌒',  name:'Profil čáry',        group:'tvar',   groupName:'Tvar',    desc:'Tolerance libovolné křivky' },
  { sym:'⊥',  name:'Kolmost',           group:'poloha', groupName:'Poloha',  desc:'90° k referenční rovině/ose' },
  { sym:'∠',  name:'Úhlovost',          group:'poloha', groupName:'Poloha',  desc:'Tolerance úhlu k základně' },
  { sym:'∥',  name:'Rovnoběžnost',      group:'poloha', groupName:'Poloha',  desc:'Paralelní s referenční plochou' },
  { sym:'⊕',  name:'Poloha',           group:'poloha', groupName:'Poloha',  desc:'Tolerance polohy prvku' },
  { sym:'◎',  name:'Souosost',          group:'poloha', groupName:'Poloha',  desc:'Odchylka os rotačních ploch' },
  { sym:'=',  name:'Souměrnost',        group:'poloha', groupName:'Poloha',  desc:'Symetrie k referenční rovině' },
  { sym:'↗',  name:'Házení (kruhové)',  group:'hazeni', groupName:'Házení',  desc:'Odchylka při otáčení – 1 řez' },
  { sym:'⇗',  name:'Celkové házení',   group:'hazeni', groupName:'Házení',  desc:'Odchylka při otáčení – celá plocha' },
]

const abbreviations = [
  { sym:'⌀',    name:'Průměr' },
  { sym:'R',    name:'Poloměr' },
  { sym:'□',    name:'Čtvercový průřez' },
  { sym:'SR',   name:'Kulový poloměr' },
  { sym:'S⌀',   name:'Kulový průměr' },
  { sym:'t',    name:'Hloubka' },
  { sym:'p',    name:'Rozteč' },
  { sym:'M',    name:'Metrický závit' },
  { sym:'Tr',   name:'Trapézový závit' },
  { sym:'G',    name:'Trubkový závit' },
  { sym:'C',    name:'Zkosení (chanfer)' },
  { sym:'TYP',  name:'Typický rozměr' },
  { sym:'MAX',  name:'Maximální hodnota' },
  { sym:'MIN',  name:'Minimální hodnota' },
  { sym:'REF',  name:'Referenční kóta' },
  { sym:'CNC',  name:'Obrábění na CNC' },
]

/* ---- ISO 2768 ---- */
const iso2768 = [
  { cls:'Jemná',      code:'f', length:'±0,05 – ±0,3 mm',  angle:'±0°5′ – ±1°',  usage:'Přesné strojní díly' },
  { cls:'Střední',    code:'m', length:'±0,1 – ±0,5 mm',   angle:'±0°10′ – ±1°30′', usage:'Obvyklé obrábění – default' },
  { cls:'Hrubá',      code:'c', length:'±0,2 – ±1,0 mm',   angle:'±0°15′ – ±3°', usage:'Odlévání, kování' },
  { cls:'Velmi hrubá',code:'v', length:'±0,5 – ±2,0 mm',   angle:'±0°30′ – ±5°', usage:'Surové výrobky' },
]

/* ---- ULOŽENÍ ---- */
const fits = [
  { fit:'H7/h6', type:'Přechodné', desc:'Snadné ruční zasunutí – ložiska, ozubená kola' },
  { fit:'H7/f7', type:'Kluzné',    desc:'Kluzné uložení – hřídele v kluzných ložiskách' },
  { fit:'H7/n6', type:'Lisované',  desc:'Lehké lisování – náboje, pouzdra' },
  { fit:'H7/p6', type:'Lisované',  desc:'Pevné lisování – ozubená kola na hřídelích' },
  { fit:'H7/r6', type:'Lisované',  desc:'Těsné lisování – spojky, bubny' },
  { fit:'H7/s6', type:'Přesah',    desc:'Velký přesah – těžce namáhané spoje' },
  { fit:'H8/e8', type:'Volné',     desc:'Volné kluzné – čerpadla, kompresory' },
  { fit:'H9/d9', type:'Volné',     desc:'Velmi volné – pohyblivé části, pístnice' },
]
</script>

<style scoped>
.kucharka-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ---- TABS ---- */
.tabs-nav {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs-nav::-webkit-scrollbar { display: none; }

.tab-btn {
  flex: 1;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font);
  transition: color 0.15s, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.tab-btn:active { background: var(--accent-light); }
.tab-btn--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.tab-btn__icon { font-size: 20px; line-height: 1; }
.tab-btn__label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }

/* ---- LAYOUT ---- */
.container-wide {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

/* ---- HEADINGS ---- */
.section-heading {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  margin: 20px 0 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.section-note {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.subsection-heading {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 24px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

/* ---- TOOL CARDS ---- */
.tool-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
@media (min-width: 480px) {
  .tool-grid { grid-template-columns: 1fr 1fr; }
}

.tool-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
}
.tool-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.tool-card__icon {
  font-size: 22px;
  color: var(--accent);
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.tool-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}
.tool-card__desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
}
.param-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  padding: 3px 0;
  border-top: 1px solid var(--border);
  gap: 8px;
}
.param-row__key {
  color: var(--text-muted);
  flex-shrink: 0;
}
.param-row__val {
  color: var(--accent);
  font-weight: 600;
  text-align: right;
}

/* ---- TABLES ---- */
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 360px;
}
.data-table thead {
  background: var(--bg-secondary);
  position: sticky;
  top: 56px;
}
.data-table th {
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 2px solid var(--accent);
  white-space: nowrap;
}
.data-table th small {
  display: block;
  font-size: 10px;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: none;
  letter-spacing: 0;
}
.data-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--accent-light); }
.tr-highlight { background: rgba(240, 165, 0, 0.06); }
.tr-highlight .td-name { color: var(--accent); font-weight: 700; }

.td-name { font-weight: 600; white-space: nowrap; }
.td-drill { color: var(--accent); font-weight: 700; }
.td-usage { color: var(--text-secondary); font-size: 12px; }
.td-sym { font-size: 18px; text-align: center; }

/* ---- RA CHIP ---- */
.ra-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
}

/* ---- SYMBOL CARDS ---- */
.symbol-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.symbol-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  min-width: 130px;
  flex: 1;
}
.symbol-card__sym {
  font-size: 22px;
  display: block;
  margin-bottom: 6px;
}
.symbol-card__desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* ---- BADGE GROUP ---- */
.badge-group {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.badge-tvar    { background: rgba(37,99,235,0.2); color: #60a5fa; }
.badge-poloha  { background: rgba(5,150,105,0.2); color: #34d399; }
.badge-hazeni  { background: rgba(217,119,6,0.2);  color: #fbbf24; }

/* ---- ABBREVIATIONS GRID ---- */
.abbr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.abbr-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.abbr-card__sym {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}
.abbr-card__name {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ---- FITS GRID ---- */
.fits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 24px;
}
@media (min-width: 480px) {
  .fits-grid { grid-template-columns: 1fr 1fr; }
}
.fit-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.fit-card__fit {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}
.fit-card__type {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.fit-card__desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ---- INFO BOX ---- */
.info-box {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
}
.info-box__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 6px;
}
.info-box__text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}
.info-box__text code {
  background: var(--bg-input);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--text-primary);
}
</style>
