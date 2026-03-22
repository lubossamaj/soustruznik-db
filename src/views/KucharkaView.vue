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
          <h2 class="section-heading">Nástroje N1 – N30</h2>
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
                <div class="tool-row__pos">
                  {{ tool.id }}
                  <span v-if="tool.manufacturerCode" class="tool-row__mfr">{{ tool.manufacturerCode }}</span>
                </div>
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
          <h2 class="section-heading">Kalkulátor závitů</h2>
          <p class="section-note">Vyberte typ a velikost závitu – zobrazí se všechny rozměry pro soustružení</p>

          <!-- Výběr typu závitu -->
          <div class="form-group">
            <label class="form-label">Typ závitu</label>
            <div class="shape-toggle" style="flex-wrap:wrap">
              <button
                v-for="type in threadTypes"
                :key="type.id"
                class="shape-btn"
                :class="{ 'shape-btn--active': threadCalc.type === type.id }"
                @click="threadCalc.type = type.id; threadCalc.size = null"
                type="button"
              >{{ type.id }}</button>
            </div>
            <div class="calc-note" style="margin-top:6px">
              {{ threadTypes.find(t => t.id === threadCalc.type)?.info }}
            </div>
          </div>

          <!-- Výběr velikosti -->
          <div class="form-group">
            <label class="form-label">Velikost</label>
            <select v-model="threadCalc.size" class="form-control">
              <option :value="null">— vyberte velikost —</option>
              <option v-for="t in threadData[threadCalc.type]" :key="t.label" :value="t">
                {{ t.label }}
              </option>
            </select>
          </div>

          <!-- Výsledky -->
          <div v-if="threadCalc.size" class="thread-result">
            <div class="thread-result__title">
              {{ threadCalc.size.label }}
              <span class="thread-result__sub">{{ threadTypes.find(t=>t.id===threadCalc.type)?.short }}</span>
            </div>

            <div class="thread-dims">
              <div class="thread-dim thread-dim--outer">
                <div class="thread-dim__icon">⌀</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Vnější průměr d</div>
                  <div class="thread-dim__hint">Průměr tyče před řezáním závitu</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.d }} mm</div>
              </div>
              <div class="thread-dim thread-dim--pitch">
                <div class="thread-dim__icon">≈</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Střední průměr d₂</div>
                  <div class="thread-dim__hint">Střední průměr závitového profilu</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.d2 }} mm</div>
              </div>
              <div class="thread-dim thread-dim--minor">
                <div class="thread-dim__icon">○</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Malý průměr d₁</div>
                  <div class="thread-dim__hint">Průměr dna závitu šroubu (cíl soustružení)</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.d1 }} mm</div>
              </div>
              <div class="thread-dim thread-dim--drill">
                <div class="thread-dim__icon">✦</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Průměr vrtáku</div>
                  <div class="thread-dim__hint">Vrtat otvor před řezáním závitu matice</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.drill }} mm</div>
              </div>
              <div class="thread-dim thread-dim--pitch-val">
                <div class="thread-dim__icon">↔</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Rozteč p</div>
                  <div class="thread-dim__hint">Nastavení převodovky soustruhu</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.p }}</div>
              </div>
              <div class="thread-dim thread-dim--depth">
                <div class="thread-dim__icon">↕</div>
                <div class="thread-dim__info">
                  <div class="thread-dim__label">Hloubka závitu h</div>
                  <div class="thread-dim__hint">Celková hloubka záběru nože</div>
                </div>
                <div class="thread-dim__val">{{ threadCalc.size.h }} mm</div>
              </div>
            </div>
          </div>

          <div v-else class="thread-empty">
            <div class="thread-empty__icon">🔩</div>
            <div>Vyberte velikost závitu pro zobrazení rozměrů</div>
          </div>
        </section>

        <!-- ==================== HMOTNOST ==================== -->
        <section v-if="activeTab === 'hmotnost'">
          <h2 class="section-heading">Kalkulačka hmotnosti</h2>
          <p class="section-note">Výpočet hmotnosti polotovaru dle tvaru a materiálu</p>

          <div class="calc-card">
            <div class="calc-card__title">⚖️ Výpočet hmotnosti</div>

            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">Tvar polotovaru</label>
              <div class="shape-toggle">
                <button class="shape-btn" :class="{ 'shape-btn--active': weight.shape === 'round' }" @click="weight.shape = 'round'" type="button">⬤ Kruhová tyč</button>
                <button class="shape-btn" :class="{ 'shape-btn--active': weight.shape === 'rect' }" @click="weight.shape = 'rect'" type="button">▬ Kvádr</button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label class="form-label">Materiál</label>
              <div class="mat-grid">
                <button
                  v-for="m in weightMaterials"
                  :key="m.id"
                  class="mat-btn"
                  :class="{ 'mat-btn--active': weight.material === m.id }"
                  :style="{ '--mat-color': m.color }"
                  @click="weight.material = m.id"
                  type="button"
                >
                  <span class="mat-btn__symbol">{{ m.label }}</span>
                  <span class="mat-btn__name">{{ m.name }}</span>
                  <span class="mat-btn__rho">{{ m.rho }} kg/m³</span>
                </button>
              </div>
            </div>

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
        </section>

        <!-- ==================== VÝKRES ==================== -->
        <section v-if="activeTab === 'vykres'">
          <h2 class="section-heading">Výkresové vysvětlivky</h2>

          <!-- ISO 2768 TABULKA S VYHLEDÁVAČEM -->
          <h3 class="subsection-heading">Všeobecné tolerance ISO 2768 – délkové úchylky</h3>

          <div class="tol-lookup-card">
            <div class="tol-lookup__label">Zadej rozměr pro zvýraznění řádku</div>
            <div class="tol-lookup__row">
              <input
                v-model.number="tolDim"
                type="number"
                inputmode="decimal"
                class="form-control"
                placeholder="např. 180"
                min="0.5"
                step="0.1"
                style="max-width:160px"
              />
              <span class="tol-lookup__unit">mm</span>
              <span v-if="tolRow" class="tol-lookup__match">→ řádek {{ tolRow.label }}</span>
            </div>
          </div>

          <div class="table-scroll">
            <table class="data-table tol-table">
              <thead>
                <tr>
                  <th>Rozsah [mm]</th>
                  <th class="th-f">f – jemná</th>
                  <th class="th-m">m – střední</th>
                  <th class="th-c">c – hrubá</th>
                  <th class="th-v">v – velmi hrubá</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in iso2768detail"
                  :key="row.label"
                  :class="{ 'tol-row--active': tolRow && tolRow.label === row.label }"
                >
                  <td class="td-name">{{ row.label }}</td>
                  <td class="td-f">{{ row.f }}</td>
                  <td class="td-m">{{ row.m }}</td>
                  <td class="td-c">{{ row.c }}</td>
                  <td class="td-v">{{ row.v }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Výsledkové boxy pro zadaný rozměr -->
          <div v-if="tolRow" class="tol-result-grid">
            <div class="tol-result-box tol-result-box--f">
              <div class="tol-result-box__cls">f – jemná</div>
              <div class="tol-result-box__val">{{ tolRow.f }}</div>
              <div class="tol-result-box__dim">pro {{ tolDim }} mm</div>
            </div>
            <div class="tol-result-box tol-result-box--m">
              <div class="tol-result-box__cls">m – střední</div>
              <div class="tol-result-box__val">{{ tolRow.m }}</div>
              <div class="tol-result-box__dim">pro {{ tolDim }} mm</div>
            </div>
            <div class="tol-result-box tol-result-box--c">
              <div class="tol-result-box__cls">c – hrubá</div>
              <div class="tol-result-box__val">{{ tolRow.c }}</div>
              <div class="tol-result-box__dim">pro {{ tolDim }} mm</div>
            </div>
            <div class="tol-result-box tol-result-box--v">
              <div class="tol-result-box__cls">v – velmi hrubá</div>
              <div class="tol-result-box__val">{{ tolRow.v }}</div>
              <div class="tol-result-box__dim">pro {{ tolDim }} mm</div>
            </div>
          </div>

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

          <h3 class="subsection-heading">Uložení v soustavě díry H – přehled</h3>
          <div class="fits-filter">
            <button
              v-for="cls in ['Vše','H5','H6','H7','H8','H9','H10','H11','H12+']"
              :key="cls"
              class="shape-btn"
              :class="{ 'shape-btn--active': fitsFilter === cls }"
              @click="fitsFilter = cls"
              type="button"
            >{{ cls }}</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Uložení</th>
                  <th>Typ</th>
                  <th>Charakter</th>
                  <th>Použití</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in filteredFits" :key="f.fit">
                  <td class="td-name fits-name">{{ f.fit }}</td>
                  <td style="white-space:nowrap;font-size:12px">{{ f.type }}</td>
                  <td>
                    <span class="fits-char" :class="'fits-char--' + f.char">
                      {{ f.char === 'V' ? 'Vůle' : f.char === 'P' ? 'Přechod' : 'Přesah' }}
                    </span>
                  </td>
                  <td class="td-usage">{{ f.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- DRSNOST POVRCHU Ra (přesunuto z vlastního tabu) -->
          <h3 class="subsection-heading">Drsnost povrchu Ra – ISO 4287</h3>
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

            <!-- Označení výrobce -->
            <div class="form-group">
              <label class="form-label">Označení výrobce / katalogové číslo</label>
              <input v-model="editModal.form.manufacturerCode" type="text" class="form-control"
                placeholder="např. Iskar 1350, CNMG 120408, SDNCN 2020" autocomplete="off" spellcheck="false" />
            </div>

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
                  <button type="button" class="btn btn-ghost" @click="confirmRemoveToolPhoto = true">Odebrat</button>
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

    <!-- DIALOG: Odebrat fotku nástroje -->
    <transition name="fade">
      <div v-if="confirmRemoveToolPhoto" class="modal-overlay" @click.self="confirmRemoveToolPhoto = false">
        <div class="modal">
          <div class="modal__title">Odebrat fotku nástroje?</div>
          <div class="modal__text">
            Opravdu chcete odebrat fotku nástroje <strong>{{ editModal.tool.id }}</strong>?
          </div>
          <div class="modal__actions">
            <button class="btn btn-ghost" type="button" @click="confirmRemoveToolPhoto = false">
              Zrušit
            </button>
            <button class="btn btn-danger" type="button" @click="doRemoveToolPhoto">
              Odebrat
            </button>
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
  { id: 'hmotnost',  icon: '⚖️', label: 'Hmotnost'  },
  { id: 'vykres',    icon: '📐', label: 'Výkres'    },
]
const activeTab = ref('noze')

// ---- EDIT MODAL ----
const editModal = reactive({
  open: false,
  tool: {},
  form: {
    manufacturerCode: '', name: '', photo: null, description: '',
    rpmMin: '', rpmMax: '', material: '', note: '',
  },
})

function openEdit(tool) {
  editModal.tool = tool
  editModal.form = {
    manufacturerCode: tool.manufacturerCode || '',
    name:             tool.name             || '',
    photo:            tool.photo            || null,
    description:      tool.description      || '',
    rpmMin:           tool.rpmMin           || '',
    rpmMax:           tool.rpmMax           || '',
    material:         tool.material         || '',
    note:             tool.note             || '',
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

const confirmRemoveToolPhoto = ref(false)

function doRemoveToolPhoto() {
  editModal.form.photo = null
  confirmRemoveToolPhoto.value = false
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
  { id: 'ocel',  label: 'Fe',  name: 'Ocel / Nerez', rho: 7874, color: '#9ca3af' },
  { id: 'hlinik',label: 'Al',  name: 'Hliník',       rho: 2700, color: '#60a5fa' },
  { id: 'med',   label: 'Cu',  name: 'Měď',          rho: 8900, color: '#fb923c' },
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

// ---- FITS FILTER ----
const fitsFilter = ref('Vše')
const filteredFits = computed(() => {
  if (fitsFilter.value === 'Vše') return fits
  const prefix = fitsFilter.value === 'H12+' ? ['H12', 'H13'] : [fitsFilter.value]
  return fits.filter(f => prefix.some(p => f.fit.startsWith(p + '/')))
})

// ---- ISO 2768 TOLERANCE VYHLEDÁVAČ ----
const tolDim = ref(null)

const iso2768detail = [
  { label:'0,5 – 3',      min:0.5,   max:3,    f:'±0,05', m:'±0,1',  c:'±0,2',  v:'–'    },
  { label:'> 3 – 6',      min:3,     max:6,    f:'±0,05', m:'±0,1',  c:'±0,3',  v:'±0,5' },
  { label:'> 6 – 30',     min:6,     max:30,   f:'±0,1',  m:'±0,2',  c:'±0,5',  v:'±1,0' },
  { label:'> 30 – 120',   min:30,    max:120,  f:'±0,15', m:'±0,3',  c:'±0,8',  v:'±1,5' },
  { label:'> 120 – 400',  min:120,   max:400,  f:'±0,2',  m:'±0,5',  c:'±1,2',  v:'±2,5' },
  { label:'> 400 – 1000', min:400,   max:1000, f:'±0,3',  m:'±0,8',  c:'±2,0',  v:'±4,0' },
  { label:'> 1000 – 2000',min:1000,  max:2000, f:'±0,5',  m:'±1,2',  c:'±3,0',  v:'±6,0' },
  { label:'> 2000 – 4000',min:2000,  max:4000, f:'–',     m:'±2,0',  c:'±4,0',  v:'±8,0' },
]

const tolRow = computed(() => {
  if (!tolDim.value || tolDim.value <= 0) return null
  return iso2768detail.find(r => tolDim.value > r.min && tolDim.value <= r.max)
    ?? (tolDim.value <= 0.5 ? null : iso2768detail[iso2768detail.length - 1])
})

// ---- KALKULÁTOR ZÁVITŮ ----
const threadCalc = reactive({ type: 'M', size: null })

const threadTypes = [
  { id:'M',   short:'Metrický ISO',      info:'ISO 724 • úhel 60° • rozteč v mm' },
  { id:'W',   short:'Whitworthův (BSW)', info:'BSW • úhel 55° • rozteč v TPI (závitů/palec)' },
  { id:'G',   short:'Trubkový BSP',      info:'ISO 228 • úhel 55° • označení v palcích, rozměry v mm' },
  { id:'Tr',  short:'Trapézový ISO',     info:'ISO 2904 • úhel 30° • pro pohybové šrouby' },
  { id:'UNC', short:'Americký UNC',      info:'ASME B1.1 • úhel 60° • rozteč v TPI' },
]

const threadData = {
  M: [
    { label:'M1',    d:'1,000',  p:'0,25 mm',  d2:'0,838',  d1:'0,693',  drill:'0,75',  h:'0,153' },
    { label:'M1,2',  d:'1,200',  p:'0,25 mm',  d2:'1,038',  d1:'0,893',  drill:'0,95',  h:'0,153' },
    { label:'M1,4',  d:'1,400',  p:'0,3 mm',   d2:'1,205',  d1:'1,032',  drill:'1,10',  h:'0,184' },
    { label:'M1,6',  d:'1,600',  p:'0,35 mm',  d2:'1,373',  d1:'1,171',  drill:'1,25',  h:'0,215' },
    { label:'M2',    d:'2,000',  p:'0,4 mm',   d2:'1,740',  d1:'1,509',  drill:'1,60',  h:'0,245' },
    { label:'M2,5',  d:'2,500',  p:'0,45 mm',  d2:'2,208',  d1:'1,948',  drill:'2,05',  h:'0,276' },
    { label:'M3',    d:'3,000',  p:'0,5 mm',   d2:'2,675',  d1:'2,387',  drill:'2,50',  h:'0,307' },
    { label:'M4',    d:'4,000',  p:'0,7 mm',   d2:'3,545',  d1:'3,141',  drill:'3,30',  h:'0,429' },
    { label:'M5',    d:'5,000',  p:'0,8 mm',   d2:'4,480',  d1:'4,019',  drill:'4,20',  h:'0,491' },
    { label:'M6',    d:'6,000',  p:'1,0 mm',   d2:'5,350',  d1:'4,917',  drill:'5,00',  h:'0,613' },
    { label:'M8',    d:'8,000',  p:'1,25 mm',  d2:'7,188',  d1:'6,647',  drill:'6,80',  h:'0,767' },
    { label:'M10',   d:'10,000', p:'1,5 mm',   d2:'9,026',  d1:'8,376',  drill:'8,50',  h:'0,920' },
    { label:'M12',   d:'12,000', p:'1,75 mm',  d2:'10,863', d1:'10,106', drill:'10,20', h:'1,074' },
    { label:'M14',   d:'14,000', p:'2,0 mm',   d2:'12,701', d1:'11,835', drill:'12,00', h:'1,227' },
    { label:'M16',   d:'16,000', p:'2,0 mm',   d2:'14,701', d1:'13,835', drill:'14,00', h:'1,227' },
    { label:'M18',   d:'18,000', p:'2,5 mm',   d2:'16,376', d1:'15,294', drill:'15,50', h:'1,534' },
    { label:'M20',   d:'20,000', p:'2,5 mm',   d2:'18,376', d1:'17,294', drill:'17,50', h:'1,534' },
    { label:'M22',   d:'22,000', p:'2,5 mm',   d2:'20,376', d1:'19,294', drill:'19,50', h:'1,534' },
    { label:'M24',   d:'24,000', p:'3,0 mm',   d2:'22,051', d1:'20,752', drill:'21,00', h:'1,840' },
    { label:'M27',   d:'27,000', p:'3,0 mm',   d2:'25,051', d1:'23,752', drill:'24,00', h:'1,840' },
    { label:'M30',   d:'30,000', p:'3,5 mm',   d2:'27,727', d1:'26,211', drill:'26,50', h:'2,147' },
    { label:'M33',   d:'33,000', p:'3,5 mm',   d2:'30,727', d1:'29,211', drill:'29,50', h:'2,147' },
    { label:'M36',   d:'36,000', p:'4,0 mm',   d2:'33,402', d1:'31,670', drill:'32,00', h:'2,454' },
    { label:'M39',   d:'39,000', p:'4,0 mm',   d2:'36,402', d1:'34,670', drill:'35,00', h:'2,454' },
    { label:'M42',   d:'42,000', p:'4,5 mm',   d2:'39,077', d1:'37,129', drill:'37,50', h:'2,760' },
    { label:'M45',   d:'45,000', p:'4,5 mm',   d2:'42,077', d1:'40,129', drill:'40,50', h:'2,760' },
    { label:'M48',   d:'48,000', p:'5,0 mm',   d2:'44,752', d1:'42,587', drill:'43,00', h:'3,067' },
    { label:'M52',   d:'52,000', p:'5,0 mm',   d2:'48,752', d1:'46,587', drill:'47,00', h:'3,067' },
    { label:'M56',   d:'56,000', p:'5,5 mm',   d2:'52,428', d1:'50,046', drill:'50,50', h:'3,374' },
    { label:'M60',   d:'60,000', p:'5,5 mm',   d2:'56,428', d1:'54,046', drill:'54,50', h:'3,374' },
    { label:'M64',   d:'64,000', p:'6,0 mm',   d2:'60,103', d1:'57,505', drill:'58,00', h:'3,680' },
  ],
  W: [
    { label:'W 1/8"',   d:'3,175',  p:'0,635 mm (40 TPI)', d2:'2,859',  d1:'2,543',  drill:'2,50',  h:'0,320' },
    { label:'W 3/16"',  d:'4,762',  p:'1,058 mm (24 TPI)', d2:'4,228',  d1:'3,694',  drill:'3,70',  h:'0,534' },
    { label:'W 1/4"',   d:'6,350',  p:'1,270 mm (20 TPI)', d2:'5,664',  d1:'4,978',  drill:'5,00',  h:'0,640' },
    { label:'W 5/16"',  d:'7,938',  p:'1,411 mm (18 TPI)', d2:'7,097',  d1:'6,255',  drill:'6,20',  h:'0,713' },
    { label:'W 3/8"',   d:'9,525',  p:'1,588 mm (16 TPI)', d2:'8,509',  d1:'7,493',  drill:'7,50',  h:'0,801' },
    { label:'W 7/16"',  d:'11,113', p:'1,814 mm (14 TPI)', d2:'9,901',  d1:'8,688',  drill:'8,70',  h:'0,914' },
    { label:'W 1/2"',   d:'12,700', p:'2,117 mm (12 TPI)', d2:'11,299', d1:'9,898',  drill:'9,90',  h:'1,067' },
    { label:'W 9/16"',  d:'14,288', p:'2,117 mm (12 TPI)', d2:'12,887', d1:'11,486', drill:'11,50', h:'1,067' },
    { label:'W 5/8"',   d:'15,875', p:'2,309 mm (11 TPI)', d2:'14,238', d1:'12,601', drill:'12,60', h:'1,164' },
    { label:'W 3/4"',   d:'19,050', p:'2,540 mm (10 TPI)', d2:'17,100', d1:'15,150', drill:'15,00', h:'1,281' },
    { label:'W 7/8"',   d:'22,225', p:'2,822 mm (9 TPI)',  d2:'19,975', d1:'17,724', drill:'17,50', h:'1,422' },
    { label:'W 1"',     d:'25,400', p:'3,175 mm (8 TPI)',  d2:'22,740', d1:'20,080', drill:'20,00', h:'1,600' },
    { label:'W 1 1/4"', d:'31,750', p:'3,629 mm (7 TPI)',  d2:'28,586', d1:'25,421', drill:'25,50', h:'1,829' },
    { label:'W 1 1/2"', d:'38,100', p:'4,233 mm (6 TPI)',  d2:'34,323', d1:'30,546', drill:'30,50', h:'2,133' },
    { label:'W 1 3/4"', d:'44,450', p:'5,080 mm (5 TPI)',  d2:'39,879', d1:'35,309', drill:'35,50', h:'2,559' },
    { label:'W 2"',     d:'50,800', p:'5,080 mm (5 TPI)',  d2:'46,229', d1:'41,659', drill:'42,00', h:'2,559' },
  ],
  G: [
    { label:'G 1/8"',   d:'9,728',  p:'0,907 mm (28 TPI)', d2:'9,147',  d1:'8,566',  drill:'8,50',  h:'0,581' },
    { label:'G 1/4"',   d:'13,157', p:'1,337 mm (19 TPI)', d2:'12,301', d1:'11,445', drill:'11,50', h:'0,856' },
    { label:'G 3/8"',   d:'16,662', p:'1,337 mm (19 TPI)', d2:'15,806', d1:'14,950', drill:'15,00', h:'0,856' },
    { label:'G 1/2"',   d:'20,955', p:'1,814 mm (14 TPI)', d2:'19,793', d1:'18,631', drill:'18,60', h:'1,162' },
    { label:'G 3/4"',   d:'26,441', p:'1,814 mm (14 TPI)', d2:'25,279', d1:'24,117', drill:'24,00', h:'1,162' },
    { label:'G 1"',     d:'33,249', p:'2,309 mm (11 TPI)', d2:'31,770', d1:'30,291', drill:'30,00', h:'1,479' },
    { label:'G 1 1/4"', d:'41,910', p:'2,309 mm (11 TPI)', d2:'40,431', d1:'38,952', drill:'39,00', h:'1,479' },
    { label:'G 1 1/2"', d:'47,803', p:'2,309 mm (11 TPI)', d2:'46,324', d1:'44,845', drill:'44,50', h:'1,479' },
    { label:'G 2"',     d:'59,614', p:'2,309 mm (11 TPI)', d2:'58,135', d1:'56,656', drill:'56,50', h:'1,479' },
    { label:'G 2 1/2"', d:'75,184', p:'2,309 mm (11 TPI)', d2:'73,705', d1:'72,226', drill:'72,00', h:'1,479' },
    { label:'G 3"',     d:'87,884', p:'2,309 mm (11 TPI)', d2:'86,405', d1:'84,926', drill:'85,00', h:'1,479' },
  ],
  Tr: [
    { label:'Tr 8×1,5',  d:'8,000',  p:'1,5 mm',  d2:'7,250',  d1:'6,200',  drill:'6,50',  h:'0,900' },
    { label:'Tr 10×2',   d:'10,000', p:'2,0 mm',  d2:'9,000',  d1:'7,500',  drill:'8,00',  h:'1,250' },
    { label:'Tr 12×2',   d:'12,000', p:'2,0 mm',  d2:'11,000', d1:'9,500',  drill:'10,00', h:'1,250' },
    { label:'Tr 14×2',   d:'14,000', p:'2,0 mm',  d2:'13,000', d1:'11,500', drill:'12,00', h:'1,250' },
    { label:'Tr 16×2',   d:'16,000', p:'2,0 mm',  d2:'15,000', d1:'13,500', drill:'14,00', h:'1,250' },
    { label:'Tr 16×4',   d:'16,000', p:'4,0 mm',  d2:'14,000', d1:'11,500', drill:'12,00', h:'2,250' },
    { label:'Tr 18×2',   d:'18,000', p:'2,0 mm',  d2:'17,000', d1:'15,500', drill:'16,00', h:'1,250' },
    { label:'Tr 18×4',   d:'18,000', p:'4,0 mm',  d2:'16,000', d1:'13,500', drill:'14,00', h:'2,250' },
    { label:'Tr 20×2',   d:'20,000', p:'2,0 mm',  d2:'19,000', d1:'17,500', drill:'18,00', h:'1,250' },
    { label:'Tr 20×4',   d:'20,000', p:'4,0 mm',  d2:'18,000', d1:'15,500', drill:'16,00', h:'2,250' },
    { label:'Tr 22×3',   d:'22,000', p:'3,0 mm',  d2:'20,500', d1:'18,500', drill:'19,00', h:'1,750' },
    { label:'Tr 22×5',   d:'22,000', p:'5,0 mm',  d2:'19,500', d1:'16,500', drill:'17,00', h:'2,750' },
    { label:'Tr 24×3',   d:'24,000', p:'3,0 mm',  d2:'22,500', d1:'20,500', drill:'21,00', h:'1,750' },
    { label:'Tr 24×5',   d:'24,000', p:'5,0 mm',  d2:'21,500', d1:'18,500', drill:'19,00', h:'2,750' },
    { label:'Tr 26×3',   d:'26,000', p:'3,0 mm',  d2:'24,500', d1:'22,500', drill:'23,00', h:'1,750' },
    { label:'Tr 26×5',   d:'26,000', p:'5,0 mm',  d2:'23,500', d1:'20,500', drill:'21,00', h:'2,750' },
    { label:'Tr 28×3',   d:'28,000', p:'3,0 mm',  d2:'26,500', d1:'24,500', drill:'25,00', h:'1,750' },
    { label:'Tr 28×5',   d:'28,000', p:'5,0 mm',  d2:'25,500', d1:'22,500', drill:'23,00', h:'2,750' },
    { label:'Tr 30×3',   d:'30,000', p:'3,0 mm',  d2:'28,500', d1:'26,500', drill:'27,00', h:'1,750' },
    { label:'Tr 30×6',   d:'30,000', p:'6,0 mm',  d2:'27,000', d1:'23,500', drill:'24,00', h:'3,250' },
    { label:'Tr 32×3',   d:'32,000', p:'3,0 mm',  d2:'30,500', d1:'28,500', drill:'29,00', h:'1,750' },
    { label:'Tr 32×6',   d:'32,000', p:'6,0 mm',  d2:'29,000', d1:'25,500', drill:'26,00', h:'3,250' },
    { label:'Tr 36×3',   d:'36,000', p:'3,0 mm',  d2:'34,500', d1:'32,500', drill:'33,00', h:'1,750' },
    { label:'Tr 36×6',   d:'36,000', p:'6,0 mm',  d2:'33,000', d1:'29,500', drill:'30,00', h:'3,250' },
    { label:'Tr 40×3',   d:'40,000', p:'3,0 mm',  d2:'38,500', d1:'36,500', drill:'37,00', h:'1,750' },
    { label:'Tr 40×7',   d:'40,000', p:'7,0 mm',  d2:'36,500', d1:'32,500', drill:'33,00', h:'3,750' },
    { label:'Tr 44×7',   d:'44,000', p:'7,0 mm',  d2:'40,500', d1:'36,500', drill:'37,00', h:'3,750' },
    { label:'Tr 48×8',   d:'48,000', p:'8,0 mm',  d2:'44,000', d1:'39,500', drill:'40,00', h:'4,250' },
    { label:'Tr 52×8',   d:'52,000', p:'8,0 mm',  d2:'48,000', d1:'43,500', drill:'44,00', h:'4,250' },
    { label:'Tr 60×9',   d:'60,000', p:'9,0 mm',  d2:'55,500', d1:'50,500', drill:'51,00', h:'4,750' },
  ],
  UNC: [
    { label:'UNC #4',    d:'2,845',  p:'0,635 mm (40 TPI)', d2:'2,524',  d1:'2,202',  drill:'2,20',  h:'0,389' },
    { label:'UNC #6',    d:'3,505',  p:'0,794 mm (32 TPI)', d2:'3,098',  d1:'2,692',  drill:'2,70',  h:'0,406' },
    { label:'UNC #8',    d:'4,166',  p:'0,794 mm (32 TPI)', d2:'3,759',  d1:'3,353',  drill:'3,40',  h:'0,406' },
    { label:'UNC #10',   d:'4,826',  p:'1,058 mm (24 TPI)', d2:'4,292',  d1:'3,759',  drill:'3,80',  h:'0,534' },
    { label:'UNC 1/4"',  d:'6,350',  p:'1,270 mm (20 TPI)', d2:'5,664',  d1:'4,978',  drill:'5,00',  h:'0,686' },
    { label:'UNC 5/16"', d:'7,938',  p:'1,411 mm (18 TPI)', d2:'7,121',  d1:'6,305',  drill:'6,30',  h:'0,816' },
    { label:'UNC 3/8"',  d:'9,525',  p:'1,588 mm (16 TPI)', d2:'8,597',  d1:'7,670',  drill:'7,70',  h:'0,928' },
    { label:'UNC 7/16"', d:'11,113', p:'1,814 mm (14 TPI)', d2:'10,033', d1:'8,952',  drill:'9,00',  h:'1,080' },
    { label:'UNC 1/2"',  d:'12,700', p:'1,954 mm (13 TPI)', d2:'11,430', d1:'10,160', drill:'10,20', h:'1,270' },
    { label:'UNC 9/16"', d:'14,288', p:'2,117 mm (12 TPI)', d2:'12,913', d1:'11,537', drill:'11,50', h:'1,375' },
    { label:'UNC 5/8"',  d:'15,875', p:'2,309 mm (11 TPI)', d2:'14,376', d1:'12,878', drill:'12,90', h:'1,499' },
    { label:'UNC 3/4"',  d:'19,050', p:'2,540 mm (10 TPI)', d2:'17,399', d1:'15,748', drill:'15,75', h:'1,651' },
    { label:'UNC 7/8"',  d:'22,225', p:'2,822 mm (9 TPI)',  d2:'20,391', d1:'18,558', drill:'18,50', h:'1,834' },
    { label:'UNC 1"',    d:'25,400', p:'3,175 mm (8 TPI)',  d2:'23,338', d1:'21,272', drill:'21,30', h:'2,064' },
    { label:'UNC 1 1/4"',d:'31,750', p:'3,629 mm (7 TPI)',  d2:'29,401', d1:'27,051', drill:'27,00', h:'2,362' },
    { label:'UNC 1 1/2"',d:'38,100', p:'4,233 mm (6 TPI)',  d2:'35,379', d1:'32,639', drill:'32,50', h:'2,750' },
  ],
}

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


const fits = [
  // H5 – velmi přesné uložení
  { fit:'H5/g4', char:'V', type:'Kluzné přesné',      desc:'Velmi přesné kluzné – vřetena, měřidla' },
  { fit:'H5/h4', char:'V', type:'Přesné',             desc:'Přesné nastavitelné spoje bez vůle' },
  { fit:'H5/k4', char:'P', type:'Přechodné',          desc:'Přesné přechodné – přesná kola' },
  { fit:'H5/m4', char:'P', type:'Přechodné',          desc:'Přechodné s malým přesahem' },
  { fit:'H5/n4', char:'N', type:'Lehký přesah',       desc:'Lehké lisování – přesné náboje' },
  // H6 – přesné uložení
  { fit:'H6/g5', char:'V', type:'Kluzné',             desc:'Kluzné přesné – přesná ložiska' },
  { fit:'H6/h5', char:'V', type:'Přesné',             desc:'Přesná poloha – nulová vůle' },
  { fit:'H6/js5',char:'P', type:'Přechodné',          desc:'Symetrické přechodné – ozubená kola' },
  { fit:'H6/k5', char:'P', type:'Přechodné',          desc:'Přechodné – náboje, kola na hřídelích' },
  { fit:'H6/m5', char:'P', type:'Přechodné',          desc:'Přechodné s přesahem – spojovací náboje' },
  { fit:'H6/n5', char:'N', type:'Lehký přesah',       desc:'Lehké lisování – přesné pouzdra' },
  { fit:'H6/p5', char:'N', type:'Lisované',           desc:'Lisování – přesné spoje' },
  { fit:'H6/r5', char:'N', type:'Lisované',           desc:'Pevné lisování – přesné náboje' },
  { fit:'H6/s5', char:'N', type:'Těsné lisování',     desc:'Těsné lisování – permanentní spoje' },
  // H7 – nejběžnější uložení
  { fit:'H7/e8', char:'V', type:'Volné kluzné',       desc:'Volné kluzné – čerpadla, kompresory' },
  { fit:'H7/f7', char:'V', type:'Kluzné',             desc:'Kluzné – hřídele v kluzných ložiskách' },
  { fit:'H7/g6', char:'V', type:'Kluzné jemné',       desc:'Jemné kluzné – přesné posuvné díly' },
  { fit:'H7/h6', char:'V', type:'Přesné',             desc:'Ruční zasunutí – ložiska, ozubená kola' },
  { fit:'H7/js6',char:'P', type:'Přechodné',          desc:'Symetrické přechodné – spojovací náboje' },
  { fit:'H7/k6', char:'P', type:'Přechodné',          desc:'Přechodné – náboje, ozubená kola' },
  { fit:'H7/m6', char:'P', type:'Přechodné',          desc:'Přechodné s přesahem – spojky, náboje' },
  { fit:'H7/n6', char:'N', type:'Lehký přesah',       desc:'Lehké lisování – náboje, pouzdra' },
  { fit:'H7/p6', char:'N', type:'Lisované',           desc:'Lisování – ozubená kola na hřídelích' },
  { fit:'H7/r6', char:'N', type:'Lisované',           desc:'Pevné lisování – spojky, bubny' },
  { fit:'H7/s6', char:'N', type:'Těsné lisování',     desc:'Velký přesah – těžce namáhané spoje' },
  { fit:'H7/t6', char:'N', type:'Silné lisování',     desc:'Silné lisování – permanentní spoje' },
  { fit:'H7/u6', char:'N', type:'Silné lisování',     desc:'Velmi silný přesah – svěrné spoje' },
  // H8 – normální uložení
  { fit:'H8/d9', char:'V', type:'Volné',              desc:'Volné – pohyblivé části, pístnice' },
  { fit:'H8/e8', char:'V', type:'Volné kluzné',       desc:'Volné kluzné – větší ložiska' },
  { fit:'H8/f7', char:'V', type:'Kluzné',             desc:'Kluzné – běžná kluzná ložiska' },
  { fit:'H8/h7', char:'V', type:'Přesné',             desc:'Přesné nastavitelné – polohovací spoje' },
  { fit:'H8/js7',char:'P', type:'Přechodné',          desc:'Přechodné – víka, příruby' },
  { fit:'H8/k7', char:'P', type:'Přechodné',          desc:'Přechodné – náboje, kola' },
  { fit:'H8/s7', char:'N', type:'Lisované',           desc:'Lisování – pevné spoje' },
  { fit:'H8/u7', char:'N', type:'Silné lisování',     desc:'Silné lisování – permanentní spoje' },
  // H9 – hrubší uložení
  { fit:'H9/d9', char:'V', type:'Volné',              desc:'Volné – posuvné části, vedení' },
  { fit:'H9/e9', char:'V', type:'Volné kluzné',       desc:'Volné kluzné – větší stroje' },
  { fit:'H9/h9', char:'V', type:'Přesné',             desc:'Přesné – šrouby, kolíky' },
  // H10
  { fit:'H10/d10',char:'V',type:'Volné',              desc:'Volné – hrubší posuvné spoje' },
  { fit:'H10/h10',char:'V',type:'Přesné',             desc:'Přesné – hrubší spoje' },
  // H11 – hrubé uložení
  { fit:'H11/a11',char:'V',type:'Velmi volné',        desc:'Velmi volné – hrubé odlitky' },
  { fit:'H11/b11',char:'V',type:'Velmi volné',        desc:'Velmi volné – surové výrobky' },
  { fit:'H11/c11',char:'V',type:'Volné hrubé',        desc:'Hrubé volné – svařované konstrukce' },
  { fit:'H11/h11',char:'V',type:'Hrubé přesné',       desc:'Hrubé přesné – neobrobené plochy' },
  // H12, H13
  { fit:'H12/b12',char:'V',type:'Velmi volné',        desc:'Velmi volné hrubé – lité díly' },
  { fit:'H13/h13',char:'V',type:'Hrubé',              desc:'Nejhrubší – neobrobené povrchy' },
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
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tool-row__mfr {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0 5px;
  letter-spacing: 0.2px;
  text-transform: none;
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
.mat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.mat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 8px;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-family: var(--font);
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}
.mat-btn:active { transform: scale(0.97); }
.mat-btn--active {
  border-color: var(--mat-color);
  background: color-mix(in srgb, var(--mat-color) 12%, var(--bg-secondary));
}
.mat-btn__symbol {
  font-size: 22px;
  font-weight: 800;
  color: var(--mat-color);
  letter-spacing: -0.5px;
  line-height: 1;
}
.mat-btn__name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.3;
}
.mat-btn__rho {
  font-size: 10px;
  color: var(--text-muted);
}
.shape-btn--active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ---- THREAD CALCULATOR ---- */
.thread-result {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
}
.thread-result__title {
  background: var(--bg-secondary);
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  display: flex;
  align-items: baseline;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}
.thread-result__sub {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
}
.thread-dims {
  display: flex;
  flex-direction: column;
}
.thread-dim {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
}
.thread-dim:last-child { border-bottom: none; }
.thread-dim__icon {
  width: 28px;
  text-align: center;
  font-size: 18px;
  flex-shrink: 0;
}
.thread-dim__info {
  flex: 1;
  min-width: 0;
}
.thread-dim__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.thread-dim__hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}
.thread-dim__val {
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
  text-align: right;
}
.thread-dim--outer  .thread-dim__icon, .thread-dim--outer  .thread-dim__val { color: var(--accent); }
.thread-dim--minor  .thread-dim__icon, .thread-dim--minor  .thread-dim__val { color: #f87171; }
.thread-dim--drill  .thread-dim__icon, .thread-dim--drill  .thread-dim__val { color: #34d399; }
.thread-dim--pitch  .thread-dim__icon, .thread-dim--pitch  .thread-dim__val { color: #a78bfa; }
.thread-dim--pitch-val .thread-dim__val { color: var(--text-secondary); font-size: 13px; }
.thread-dim--depth     .thread-dim__val { color: var(--text-secondary); font-size: 13px; }

.thread-empty {
  text-align: center;
  padding: 36px 16px;
  color: var(--text-muted);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.thread-empty__icon { font-size: 40px; opacity: 0.4; }

/* ---- FITS ---- */
.fits-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.fits-filter .shape-btn {
  flex: none;
  min-width: auto;
  padding: 6px 12px;
  font-size: 12px;
}
.fits-name { font-family: monospace; font-size: 14px; letter-spacing: 0.3px; }
.fits-char {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.fits-char--V { background: rgba(52,211,153,0.15); color: #34d399; }
.fits-char--P { background: rgba(251,191,36,0.15); color: #fbbf24; }
.fits-char--N { background: rgba(248,113,113,0.15); color: #f87171; }

/* ---- ISO 2768 TOLERANCE ---- */
.tol-lookup-card {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 12px;
}
.tol-lookup__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.tol-lookup__row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.tol-lookup__unit {
  font-size: 14px;
  color: var(--text-muted);
}
.tol-lookup__match {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
}

/* Barevné hlavičky sloupců */
.tol-table .th-f { color: #60a5fa; }
.tol-table .th-m { color: #34d399; }
.tol-table .th-c { color: #fbbf24; }
.tol-table .th-v { color: #f87171; }

.tol-table .td-f { color: #60a5fa; font-weight: 600; }
.tol-table .td-m { color: #34d399; font-weight: 600; }
.tol-table .td-c { color: #fbbf24; font-weight: 600; }
.tol-table .td-v { color: #f87171; font-weight: 600; }

/* Zvýrazněný řádek */
.tol-row--active {
  background: rgba(240, 165, 0, 0.12) !important;
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.tol-row--active .td-name { color: var(--accent); font-weight: 700; }

/* Výsledkové boxy */
.tol-result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}
@media (min-width: 480px) {
  .tol-result-grid { grid-template-columns: repeat(4, 1fr); }
}
.tol-result-box {
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  border: 1px solid;
  text-align: center;
}
.tol-result-box--f { background: rgba(96,165,250,0.1); border-color: rgba(96,165,250,0.3); }
.tol-result-box--m { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); }
.tol-result-box--c { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.3); }
.tol-result-box--v { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); }

.tol-result-box__cls {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: var(--text-secondary);
}
.tol-result-box__val {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}
.tol-result-box--f .tol-result-box__val { color: #60a5fa; }
.tol-result-box--m .tol-result-box__val { color: #34d399; }
.tol-result-box--c .tol-result-box__val { color: #fbbf24; }
.tol-result-box--v .tol-result-box__val { color: #f87171; }
.tol-result-box__dim {
  font-size: 10px;
  color: var(--text-muted);
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
