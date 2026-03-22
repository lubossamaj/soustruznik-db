<template>
  <div class="kucharka-page">

    <!-- HEADER -->
    <header class="app-header">
      <div class="app-header__inner">
        <button class="app-header__back" @click="router.back()" aria-label="Zpět">‹</button>
        <span class="app-header__title">🧑‍🍳 Soustružnická kuchařka</span>
      </div>
    </header>

    <!-- TABS (sticky pod headerem) -->
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
          <h2 class="section-heading">Nástroje T1 – T30</h2>
          <p class="section-note">Klikni na nástroj pro zobrazení nebo editaci</p>

          <div v-if="toolsStore.loading" class="loading-state">Načítám nástroje…</div>

          <div v-else class="tools-list">
            <div
              v-for="tool in toolsStore.tools"
              :key="tool.id"
              class="tool-row"
              @click="openEdit(tool)"
            >
              <!-- Fotka / placeholder -->
              <div class="tool-row__photo">
                <img v-if="tool.photo" :src="tool.photo" alt="" class="tool-row__img" />
                <span v-else class="tool-row__noimg">🔧</span>
              </div>

              <!-- Info -->
              <div class="tool-row__info">
                <div class="tool-row__pos">{{ tool.id }}</div>
                <div class="tool-row__name" :class="{ 'tool-row__name--empty': !tool.name }">
                  {{ tool.name || 'Nenastaveno' }}
                </div>
                <div v-if="tool.material" class="tool-row__material">{{ tool.material }}</div>
                <div v-if="tool.rpmMin || tool.rpmMax" class="tool-row__rpm">
                  {{ tool.rpmMin }}–{{ tool.rpmMax }} ot/min
                </div>
              </div>

              <!-- Šipka -->
              <div class="tool-row__arrow">›</div>
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

          <h3 class="subsection-heading">Geometrické tolerance (GD&T)</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Zn.</th>
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

          <h3 class="subsection-heading">Časté zkratky a značky</h3>
          <div class="abbr-grid">
            <div v-for="a in abbreviations" :key="a.sym" class="abbr-card">
              <span class="abbr-card__sym">{{ a.sym }}</span>
              <span class="abbr-card__name">{{ a.name }}</span>
            </div>
          </div>

          <h3 class="subsection-heading">Všeobecné tolerance ISO 2768</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Třída</th>
                  <th>Kód</th>
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

          <h3 class="subsection-heading">Příklady uložení – soustava díry H</h3>
          <div class="fits-grid">
            <div v-for="f in fits" :key="f.fit" class="fit-card">
              <div class="fit-card__fit">{{ f.fit }}</div>
              <div class="fit-card__type">{{ f.type }}</div>
              <div class="fit-card__desc">{{ f.desc }}</div>
            </div>
          </div>
        </section>

        <!-- ==================== ŘEZNÉ PODMÍNKY ==================== -->
        <section v-if="activeTab === 'podminky'">
          <h2 class="section-heading">Řezné podmínky</h2>

          <!-- KALKULAČKA OTÁČEK -->
          <div class="calc-card">
            <div class="calc-card__title">🧮 Kalkulačka otáček</div>
            <div class="calc-note">n = (vc × 1000) / (π × d)</div>
            <div class="calc-grid">
              <div class="form-group">
                <label class="form-label">Průměr obrobku d [mm]</label>
                <input v-model.number="calc.d" type="number" inputmode="decimal" class="form-control" placeholder="např. 50" min="0.1" step="0.1" />
              </div>
              <div class="form-group">
                <label class="form-label">Řezná rychlost vc [m/min]</label>
                <input v-model.number="calc.vc" type="number" inputmode="decimal" class="form-control" placeholder="např. 150" min="1" step="1" />
              </div>
            </div>
            <div class="calc-result" v-if="calcRpm !== null">
              <span class="calc-result__label">Otáčky n =</span>
              <span class="calc-result__value">{{ calcRpm }} ot/min</span>
            </div>
            <div class="calc-result calc-result--empty" v-else>
              Zadej průměr a řeznou rychlost
            </div>

            <!-- Kalkulačka posuvu mm/min -->
            <div class="calc-divider"></div>
            <div class="calc-card__title" style="margin-bottom:12px">Posuv mm/min → mm/ot</div>
            <div class="calc-note">f[mm/ot] = vf / n</div>
            <div class="calc-grid">
              <div class="form-group">
                <label class="form-label">Posuv vf [mm/min]</label>
                <input v-model.number="calc.vf" type="number" inputmode="decimal" class="form-control" placeholder="např. 80" min="1" step="1" />
              </div>
              <div class="form-group">
                <label class="form-label">Otáčky n [ot/min]</label>
                <input v-model.number="calc.n" type="number" inputmode="decimal" class="form-control" placeholder="z kalkulačky výše" min="1" step="1" />
              </div>
            </div>
            <div class="calc-result" v-if="calcFeed !== null">
              <span class="calc-result__label">Posuv f =</span>
              <span class="calc-result__value">{{ calcFeed }} mm/ot</span>
            </div>
          </div>

          <!-- KALKULAČKA VÁHY -->
          <h3 class="subsection-heading">Kalkulačka váhy materiálu</h3>
          <div class="calc-card">
            <div class="calc-card__title">⚖️ Výpočet hmotnosti</div>

            <!-- Tvar -->
            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">Tvar polotovaru</label>
              <div class="shape-toggle">
                <button
                  class="shape-btn"
                  :class="{ 'shape-btn--active': weight.shape === 'round' }"
                  @click="weight.shape = 'round'"
                  type="button"
                >⬤ Kruhová tyč</button>
                <button
                  class="shape-btn"
                  :class="{ 'shape-btn--active': weight.shape === 'rect' }"
                  @click="weight.shape = 'rect'"
                  type="button"
                >▬ Kvádr</button>
              </div>
            </div>

            <!-- Materiál -->
            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">Materiál</label>
              <div class="shape-toggle">
                <button
                  v-for="m in weightMaterials"
                  :key="m.id"
                  class="shape-btn"
                  :class="{ 'shape-btn--active': weight.material === m.id }"
                  @click="weight.material = m.id"
                  type="button"
                >{{ m.label }}</button>
              </div>
              <div class="calc-note" style="margin-top:4px">Hustota: {{ weightMaterials.find(m=>m.id===weight.material)?.rho }} kg/m³</div>
            </div>

            <!-- Rozměry – kruhová tyč -->
            <div v-if="weight.shape === 'round'" class="calc-grid">
              <div class="form-group">
                <label class="form-label">Průměr d [mm]</label>
                <input v-model.number="weight.d" type="number" inputmode="decimal" class="form-control" placeholder="např. 50" min="0.1" step="0.1" />
              </div>
              <div class="form-group">
                <label class="form-label">Délka L [mm]</label>
                <input v-model.number="weight.L" type="number" inputmode="decimal" class="form-control" placeholder="např. 1000" min="0.1" step="1" />
              </div>
            </div>

            <!-- Rozměry – kvádr -->
            <div v-if="weight.shape === 'rect'">
              <div class="calc-grid">
                <div class="form-group">
                  <label class="form-label">Šířka a [mm]</label>
                  <input v-model.number="weight.a" type="number" inputmode="decimal" class="form-control" placeholder="např. 50" min="0.1" step="0.1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Výška b [mm]</label>
                  <input v-model.number="weight.b" type="number" inputmode="decimal" class="form-control" placeholder="např. 50" min="0.1" step="0.1" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Délka L [mm]</label>
                <input v-model.number="weight.L" type="number" inputmode="decimal" class="form-control" placeholder="např. 1000" min="0.1" step="1" />
              </div>
            </div>

            <!-- Výsledek -->
            <div v-if="calcWeight !== null" class="calc-result" style="flex-direction:column;align-items:flex-start;gap:4px">
              <div style="display:flex;align-items:center;gap:10px;width:100%">
                <span class="calc-result__label">Hmotnost =</span>
                <span class="calc-result__value">{{ calcWeight.kg }} kg</span>
              </div>
              <div style="font-size:12px;color:var(--text-muted)">
                Objem: {{ calcWeight.cm3 }} cm³ &nbsp;|&nbsp; {{ calcWeight.g }} g
              </div>
            </div>
            <div v-else class="calc-result calc-result--empty">
              Zadej rozměry pro výpočet
            </div>
          </div>

          <!-- TABULKA DLE MATERIÁLU -->
          <h3 class="subsection-heading">Doporučené řezné podmínky dle materiálu</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Materiál</th>
                  <th>ISO sk.</th>
                  <th>vc [m/min]<br /><small>hrubování</small></th>
                  <th>vc [m/min]<br /><small>načisto</small></th>
                  <th>f [mm/ot]<br /><small>hrubování</small></th>
                  <th>f [mm/ot]<br /><small>načisto</small></th>
                  <th>Chlazení</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in materials" :key="m.name">
                  <td class="td-name">{{ m.name }}</td>
                  <td><span class="iso-badge" :class="'iso-' + m.iso.toLowerCase()">{{ m.iso }}</span></td>
                  <td>{{ m.vcRough }}</td>
                  <td class="td-drill">{{ m.vcFinish }}</td>
                  <td>{{ m.fRough }}</td>
                  <td>{{ m.fFinish }}</td>
                  <td class="td-usage">{{ m.cooling }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </section>

      </div>
    </main>

    <!-- ==================== EDIT MODAL (Nože) ==================== -->
    <transition name="slide-up">
      <div v-if="editModal.open" class="edit-modal-overlay" @click.self="closeEdit">
        <div class="edit-modal">

          <div class="edit-modal__header">
            <span class="edit-modal__title">{{ editModal.tool.id }} – Editace nástroje</span>
            <button class="edit-modal__close" @click="closeEdit">✕</button>
          </div>

          <div class="edit-modal__body">

            <!-- Fotka -->
            <div class="form-group">
              <label class="form-label">Fotka nástroje</label>
              <div v-if="editModal.form.photo" class="photo-current">
                <img :src="editModal.form.photo" alt="Nástroj" class="photo-preview" />
                <div style="display:flex;gap:8px;margin-top:8px">
                  <label class="btn btn-secondary" style="cursor:pointer;flex:1">
                    📷 Změnit
                    <input type="file" accept="image/*" capture="environment" class="sr-only" @change="handlePhoto" />
                  </label>
                  <button type="button" class="btn btn-ghost" @click="editModal.form.photo = null">Odebrat</button>
                </div>
              </div>
              <div v-else>
                <label class="btn btn-secondary btn-block" style="cursor:pointer">
                  📷 Přidat fotku nástroje
                  <input type="file" accept="image/*" capture="environment" class="sr-only" @change="handlePhoto" />
                </label>
              </div>
            </div>

            <!-- Název -->
            <div class="form-group">
              <label class="form-label">Název / typ nástroje</label>
              <input v-model="editModal.form.name" type="text" class="form-control"
                placeholder="např. Ubírací nůž hrubování" autocomplete="off" spellcheck="false" />
            </div>

            <!-- Popis -->
            <div class="form-group">
              <label class="form-label">Popis – co nástroj dělá</label>
              <textarea v-model="editModal.form.description" class="form-control"
                rows="3" placeholder="Popis operace, upozornění, technologie…"></textarea>
            </div>

            <!-- Otáčky -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Otáčky min [ot/min]</label>
                <input v-model="editModal.form.rpmMin" type="number" inputmode="numeric" class="form-control"
                  placeholder="např. 200" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Otáčky max [ot/min]</label>
                <input v-model="editModal.form.rpmMax" type="number" inputmode="numeric" class="form-control"
                  placeholder="např. 800" min="0" />
              </div>
            </div>

            <!-- Materiál -->
            <div class="form-group">
              <label class="form-label">Vhodné materiály</label>
              <input v-model="editModal.form.material" type="text" class="form-control"
                placeholder="např. Ocel, Litina, Hliník" autocomplete="off" spellcheck="false" />
            </div>

            <!-- Poznámka -->
            <div class="form-group">
              <label class="form-label">Poznámka / doporučení</label>
              <textarea v-model="editModal.form.note" class="form-control"
                rows="2" placeholder="Doporučení, chlazení, opotřebení…"></textarea>
            </div>

          </div>

          <div class="edit-modal__footer">
            <button class="btn btn-ghost" @click="closeEdit">Zrušit</button>
            <button class="btn btn-primary" @click="saveTool">💾 Uložit</button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from '../stores/tools.js'

const router = useRouter()
const toolsStore = useToolsStore()

const tabs = [
  { id: 'noze',      icon: '🔧', label: 'Nože'      },
  { id: 'podminky',  icon: '⚡',  label: 'Podmínky'  },
  { id: 'zavity',    icon: '🔩', label: 'Závity'    },
  { id: 'drsnost',   icon: '〰', label: 'Ra'        },
  { id: 'vykres',    icon: '📐', label: 'Výkres'    },
]
const activeTab = ref('noze')

// ---- EDIT MODAL ----
const editModal = reactive({
  open: false,
  tool: {},
  form: {
    name: '', photo: null, description: '',
    rpmMin: '', rpmMax: '', material: '', note: '',
  },
})

function openEdit(tool) {
  editModal.tool = tool
  editModal.form = {
    name:        tool.name        || '',
    photo:       tool.photo       || null,
    description: tool.description || '',
    rpmMin:      tool.rpmMin      || '',
    rpmMax:      tool.rpmMax      || '',
    material:    tool.material    || '',
    note:        tool.note        || '',
  }
  editModal.open = true
}

function closeEdit() {
  editModal.open = false
}

function handlePhoto(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { editModal.form.photo = e.target.result }
  reader.readAsDataURL(file)
  event.target.value = ''
}

function saveTool() {
  toolsStore.saveTool(editModal.tool.id, { ...editModal.form })
  editModal.open = false
}

// ---- KALKULAČKA ----
const calc = reactive({ d: null, vc: null, vf: null, n: null })

const calcRpm = computed(() => {
  if (!calc.d || !calc.vc || calc.d <= 0 || calc.vc <= 0) return null
  return Math.round((calc.vc * 1000) / (Math.PI * calc.d))
})

const calcFeed = computed(() => {
  const n = calc.n || calcRpm.value
  if (!calc.vf || !n || n <= 0) return null
  return (calc.vf / n).toFixed(3)
})

// ---- KALKULAČKA VÁHY ----
const weight = reactive({ shape: 'round', material: 'ocel', d: null, L: null, a: null, b: null })

const weightMaterials = [
  { id: 'ocel',  label: 'Ocel',  rho: 7850 },
  { id: 'nerez', label: 'Nerez', rho: 7900 },
  { id: 'med',   label: 'Měď',   rho: 8900 },
]

const calcWeight = computed(() => {
  const mat = weightMaterials.find(m => m.id === weight.material)
  if (!mat) return null
  const rho = mat.rho // kg/m³

  let volumeMm3 = null
  if (weight.shape === 'round') {
    if (!weight.d || !weight.L || weight.d <= 0 || weight.L <= 0) return null
    volumeMm3 = Math.PI / 4 * weight.d ** 2 * weight.L
  } else {
    if (!weight.a || !weight.b || !weight.L || weight.a <= 0 || weight.b <= 0 || weight.L <= 0) return null
    volumeMm3 = weight.a * weight.b * weight.L
  }

  const volumeM3 = volumeMm3 / 1e9
  const kg = volumeM3 * rho
  return {
    kg:  kg >= 0.1  ? kg.toFixed(3)  : kg.toFixed(4),
    g:   (kg * 1000).toFixed(1),
    cm3: (volumeMm3 / 1000).toFixed(2),
  }
})

// ---- DATA ----

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

const roughness = [
  { cls:'N1',  ra:'0,1',  rz:'0,5',  color:'#7c3aed', method:'Superfinishing, leštění',          usage:'Ložisková sedla, optika'       },
  { cls:'N2',  ra:'0,2',  rz:'1,0',  color:'#7c3aed', method:'Jemné leštění, honování',           usage:'Přesná ložiska, píst'          },
  { cls:'N3',  ra:'0,4',  rz:'2,0',  color:'#2563eb', method:'Honování, jemné broušení',          usage:'Válce, vnitřní průměry'        },
  { cls:'N4',  ra:'0,8',  rz:'4,0',  color:'#2563eb', method:'Jemné broušení, diamant. soustr.',  usage:'Těsnicí plochy, vodítka'       },
  { cls:'N5',  ra:'1,6',  rz:'8,0',  color:'#059669', method:'Broušení, jemné soustružení',       usage:'Funkční plochy, spojení'       },
  { cls:'N6',  ra:'3,2',  rz:'16',   color:'#059669', method:'Jemné soustružení, frézování',      usage:'Obvyklé obrábění načisto'      },
  { cls:'N7',  ra:'6,3',  rz:'32',   color:'#d97706', method:'Soustružení, frézování',            usage:'Méně důležité plochy'          },
  { cls:'N8',  ra:'12,5', rz:'63',   color:'#d97706', method:'Hrubé soustružení',                 usage:'Hrubování, povrch odlitků'     },
  { cls:'N9',  ra:'25',   rz:'125',  color:'#dc2626', method:'Hrubé obrábění, tvarování',         usage:'Skryté plochy, hrubovky'       },
  { cls:'N10', ra:'50',   rz:'250',  color:'#dc2626', method:'Opracování za tepla, lití',         usage:'Neobrobené plochy'             },
]

const raSymbols = [
  { symbol: '✓',    desc: 'Základní značka – odebrání materiálu libovolnou metodou' },
  { symbol: '✓̄',   desc: 'Odebrání materiálu nutné (soustružení, frézování…)' },
  { symbol: '○',    desc: 'Odebrání materiálu zakázáno (odlévání, kování…)' },
  { symbol: 'Ra',   desc: 'Střední aritmetická úchylka profilu' },
  { symbol: 'Rz',   desc: 'Výška nerovností profilu (10 bodů)' },
  { symbol: 'Rmax', desc: 'Největší výška nerovností' },
]

const gdtSymbols = [
  { sym:'—',  name:'Přímočarost',     group:'tvar',   groupName:'Tvar',   desc:'Odchylka od přímé linie' },
  { sym:'□',  name:'Rovinnost',       group:'tvar',   groupName:'Tvar',   desc:'Odchylka od ideální roviny' },
  { sym:'○',  name:'Kruhovitost',     group:'tvar',   groupName:'Tvar',   desc:'Odchylka od ideální kružnice' },
  { sym:'⌭',  name:'Válcovitost',     group:'tvar',   groupName:'Tvar',   desc:'Kruhovitost + přímočarost osy' },
  { sym:'⊥',  name:'Kolmost',        group:'poloha', groupName:'Poloha', desc:'90° k referenční rovině/ose' },
  { sym:'∠',  name:'Úhlovost',       group:'poloha', groupName:'Poloha', desc:'Tolerance úhlu k základně' },
  { sym:'∥',  name:'Rovnoběžnost',   group:'poloha', groupName:'Poloha', desc:'Paralelní s referenční plochou' },
  { sym:'⊕',  name:'Poloha',        group:'poloha', groupName:'Poloha', desc:'Tolerance polohy prvku' },
  { sym:'◎',  name:'Souosost',       group:'poloha', groupName:'Poloha', desc:'Odchylka os rotačních ploch' },
  { sym:'=',  name:'Souměrnost',     group:'poloha', groupName:'Poloha', desc:'Symetrie k referenční rovině' },
  { sym:'↗',  name:'Házení',         group:'hazeni', groupName:'Házení', desc:'Odchylka při otáčení – 1 řez' },
  { sym:'⇗',  name:'Celkové házení', group:'hazeni', groupName:'Házení', desc:'Odchylka při otáčení – celá plocha' },
]

const abbreviations = [
  { sym:'⌀',   name:'Průměr'         },
  { sym:'R',   name:'Poloměr'        },
  { sym:'SR',  name:'Kulový poloměr' },
  { sym:'S⌀',  name:'Kulový průměr'  },
  { sym:'□',   name:'Čtvercový průřez'},
  { sym:'t',   name:'Hloubka'        },
  { sym:'p',   name:'Rozteč'         },
  { sym:'M',   name:'Metr. závit'    },
  { sym:'Tr',  name:'Trapézový závit'},
  { sym:'G',   name:'Trubkový závit' },
  { sym:'C',   name:'Zkosení'        },
  { sym:'TYP', name:'Typický rozměr' },
  { sym:'MAX', name:'Maximum'        },
  { sym:'MIN', name:'Minimum'        },
  { sym:'REF', name:'Referenční kóta'},
  { sym:'∅',   name:'Průměr (alt.)'  },
]

const iso2768 = [
  { cls:'Jemná',       code:'f', length:'±0,05–±0,3 mm',  angle:'±0°5′–±1°',     usage:'Přesné strojní díly' },
  { cls:'Střední',     code:'m', length:'±0,1–±0,5 mm',   angle:'±0°10′–±1°30′', usage:'Obvyklé obrábění (default)' },
  { cls:'Hrubá',       code:'c', length:'±0,2–±1,0 mm',   angle:'±0°15′–±3°',    usage:'Odlévání, kování' },
  { cls:'Velmi hrubá', code:'v', length:'±0,5–±2,0 mm',   angle:'±0°30′–±5°',    usage:'Surové výrobky' },
]

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

const materials = [
  { name:'Ocel nelegovaná (C45)',    iso:'P', vcRough:'100–200',  vcFinish:'150–300',  fRough:'0,2–0,5',  fFinish:'0,05–0,2',  cooling:'Řezná emulze' },
  { name:'Ocel legovaná (42CrMo4)',  iso:'P', vcRough:'80–150',   vcFinish:'120–250',  fRough:'0,15–0,4', fFinish:'0,05–0,15', cooling:'Řezná emulze' },
  { name:'Nerezová ocel (304/316)',  iso:'M', vcRough:'60–120',   vcFinish:'100–180',  fRough:'0,1–0,3',  fFinish:'0,05–0,15', cooling:'Hojné chlazení!' },
  { name:'Šedá litina (GJL-250)',    iso:'K', vcRough:'80–150',   vcFinish:'120–200',  fRough:'0,2–0,5',  fFinish:'0,1–0,2',   cooling:'Sucho nebo vzduch' },
  { name:'Hliníkové slitiny',        iso:'N', vcRough:'300–600',  vcFinish:'500–1000', fRough:'0,2–0,5',  fFinish:'0,05–0,2',  cooling:'Řezný olej / sucho' },
  { name:'Mosaz / bronz',            iso:'N', vcRough:'150–300',  vcFinish:'200–500',  fRough:'0,2–0,4',  fFinish:'0,05–0,2',  cooling:'Sucho nebo vzduch' },
  { name:'Titan (Ti-6Al-4V)',        iso:'S', vcRough:'30–60',    vcFinish:'50–80',    fRough:'0,1–0,25', fFinish:'0,05–0,1',  cooling:'Hojné chlazení!' },
  { name:'Tvrzená ocel (>45 HRC)',   iso:'H', vcRough:'60–120',   vcFinish:'80–150',   fRough:'0,1–0,2',  fFinish:'0,05–0,1',  cooling:'CBN nástroj!' },
  { name:'Plast (PA, PE, POM)',      iso:'N', vcRough:'200–400',  vcFinish:'300–600',  fRough:'0,1–0,3',  fFinish:'0,05–0,15', cooling:'Sucho / vzduch' },
]

</script>

<style scoped>
.kucharka-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ---- TABS (sticky pod app-headerem) ---- */
.tabs-nav {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: sticky;
  top: 56px;   /* výška app-header */
  z-index: 90;
}
.tabs-nav::-webkit-scrollbar { display: none; }

.tab-btn {
  flex: 1;
  min-width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 6px;
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
.tab-btn__icon { font-size: 18px; line-height: 1; }
.tab-btn__label { font-size: 10px; font-weight: 600; letter-spacing: 0.4px; white-space: nowrap; }

/* výška tabs-nav: padding(8+8) + icon(18) + gap(2) + label(13) = ~49px → zaokrouhleno 52px */

/* ---- LAYOUT ---- */
.container-wide {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

/* ---- HEADINGS ---- */
.section-heading {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  margin: 18px 0 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.section-note {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.subsection-heading {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 22px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

/* ---- LOADING ---- */
.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}

/* ---- TOOLS LIST (T1–T30) ---- */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.15s, background 0.15s;
}
.tool-row:active {
  background: var(--accent-light);
  border-color: var(--border-accent);
}

.tool-row__photo {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-row__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tool-row__noimg {
  font-size: 22px;
  opacity: 0.3;
}

.tool-row__info {
  flex: 1;
  min-width: 0;
}
.tool-row__pos {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}
.tool-row__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tool-row__name--empty {
  color: var(--text-muted);
  font-weight: 400;
  font-style: italic;
}
.tool-row__material {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}
.tool-row__rpm {
  font-size: 11px;
  color: var(--text-muted);
}

.tool-row__arrow {
  font-size: 20px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ---- TABLES ---- */
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 4px;
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
  /* 56px (app-header) + 49px (tabs-nav) = 105px */
  top: 105px;
  z-index: 10;
}
.data-table th {
  padding: 10px 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--accent-light); }
.tr-highlight { background: rgba(240,165,0,0.06); }
.tr-highlight .td-name { color: var(--accent); font-weight: 700; }

.td-name  { font-weight: 600; white-space: nowrap; }
.td-drill { color: var(--accent); font-weight: 700; }
.td-usage { color: var(--text-secondary); font-size: 12px; }
.td-sym   { font-size: 18px; text-align: center; }

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
  padding: 10px 12px;
  min-width: 120px;
  flex: 1;
}
.symbol-card__sym  { font-size: 20px; display: block; margin-bottom: 4px; }
.symbol-card__desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }

/* ---- BADGE GROUP ---- */
.badge-group {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-tvar    { background: rgba(37,99,235,0.2);  color: #60a5fa; }
.badge-poloha  { background: rgba(5,150,105,0.2);  color: #34d399; }
.badge-hazeni  { background: rgba(217,119,6,0.2);  color: #fbbf24; }

/* ---- ABBR GRID ---- */
.abbr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.abbr-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.abbr-card__sym  { font-size: 16px; font-weight: 700; color: var(--accent); }
.abbr-card__name { font-size: 10px; color: var(--text-secondary); }

/* ---- FITS GRID ---- */
.fits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 24px;
}
.fit-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.fit-card__fit  { font-size: 15px; font-weight: 700; color: var(--accent); }
.fit-card__type { font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; margin: 2px 0; }
.fit-card__desc { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

/* ---- ISO MATERIAL BADGE ---- */
.iso-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}
.iso-p { background: rgba(37,99,235,0.2);   color: #60a5fa; }
.iso-m { background: rgba(220,38,38,0.2);   color: #f87171; }
.iso-k { background: rgba(217,119,6,0.2);   color: #fbbf24; }
.iso-n { background: rgba(5,150,105,0.2);   color: #34d399; }
.iso-s { background: rgba(124,58,237,0.2);  color: #a78bfa; }
.iso-h { background: rgba(100,100,100,0.2); color: #aaaaaa; }

/* ---- KALKULAČKA ---- */
.calc-card {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 8px;
}
.calc-card__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}
.calc-note {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
  margin-bottom: 14px;
}
.calc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.calc-result {
  margin-top: 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.calc-result--empty {
  color: var(--text-muted);
  font-size: 13px;
  justify-content: center;
}
.calc-result__label { font-size: 13px; color: var(--text-secondary); }
.calc-result__value { font-size: 20px; font-weight: 700; color: var(--accent); }
.calc-divider {
  border-top: 1px solid var(--border);
  margin: 16px 0;
}


/* ---- SHAPE TOGGLE ---- */
.shape-toggle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.shape-btn {
  flex: 1;
  min-width: 80px;
  padding: 9px 12px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.shape-btn--active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ---- INFO BOX ---- */
.info-box {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-bottom: 16px;
}
.info-box__title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
.info-box__text  { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
.info-box__text code {
  background: var(--bg-input);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--text-primary);
}

/* ---- EDIT MODAL ---- */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(2px);
}

.edit-modal {
  width: 100%;
  max-height: 92dvh;
  background: var(--bg-secondary);
  border-top: 2px solid var(--accent);
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.edit-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.edit-modal__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}
.edit-modal__close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}

.edit-modal__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

.edit-modal__footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.edit-modal__footer .btn { flex: 1; }

/* Skrytý file input */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}

.photo-current img {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  object-fit: contain;
  background: #000;
  max-height: 200px;
}

/* ---- ANIMACE MODALU ---- */
.slide-up-enter-active, .slide-up-leave-active {
  transition: opacity 0.2s, transform 0.25s;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
