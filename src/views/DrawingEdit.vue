<template>
  <div class="edit-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="app-header__inner">
        <button class="app-header__back" type="button" @click="handleCancel" aria-label="Zpět">‹</button>
        <span class="app-header__title">{{ isNew ? 'Nový výkres' : 'Upravit výkres' }}</span>
      </div>
    </header>

    <!-- FORMULÁŘ -->
    <main class="page-content">
      <div class="container">
        <form @submit.prevent="saveDrawing" novalidate>

          <!-- SEKCE: Základní informace -->
          <section class="edit-section">
            <div class="section-title">Základní informace</div>

            <div class="form-group">
              <label class="form-label" for="drawingNumber">
                Číslo výkresu <span>*</span>
              </label>
              <input
                id="drawingNumber"
                v-model.trim="form.drawingNumber"
                type="text"
                class="form-control"
                :class="{ 'form-control--error': errors.drawingNumber }"
                placeholder="např. 100023"
                inputmode="text"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="characters"
                spellcheck="false"
                required
              />
              <div v-if="errors.drawingNumber" class="form-error">{{ errors.drawingNumber }}</div>
            </div>
          </section>

          <!-- SEKCE: Fotky výkresu -->
          <section class="edit-section">
            <div class="section-title">
              Fotky výkresu
              <span class="section-title__count">({{ form.photos.length }})</span>
            </div>

            <!-- Mřížka fotek -->
            <div v-if="form.photos.length > 0" class="photos-grid">
              <div
                v-for="(photo, idx) in form.photos"
                :key="idx"
                class="photos-grid__item"
              >
                <img :src="photo" :alt="`Fotka ${idx + 1}`" class="photos-grid__img" />
                <button
                  type="button"
                  class="photos-grid__remove"
                  @click="removePhoto(idx)"
                  aria-label="Odebrat fotku"
                >✕</button>
                <span v-if="idx === 0" class="photos-grid__badge">Náhled</span>
              </div>
            </div>

            <!-- Tlačítko přidat fotku -->
            <label class="btn btn-secondary btn-block" style="cursor:pointer; margin-top: 10px;">
              📷 {{ form.photos.length === 0 ? 'Vyfotit výkres' : 'Přidat fotku' }}
              <input
                type="file"
                accept="image/*"
                class="sr-only"
                @change="handlePhotoChange"
              />
            </label>
          </section>

          <!-- SEKCE: Operace -->
          <section class="edit-section">
            <div class="section-title">
              Technologický postup
              <span class="section-title__count">({{ form.operations.length }})</span>
            </div>

            <!-- Prázdný stav operací -->
            <div v-if="form.operations.length === 0" class="ops-empty">
              <div class="ops-empty__text">Zatím žádné operace. Přidejte první.</div>
            </div>

            <!-- Formuláře operací -->
            <div class="ops-list">
              <OperationForm
                v-for="(op, index) in form.operations"
                :key="op.id"
                :operation="op"
                :index="index"
                :total="form.operations.length"
                @update="updateOperation(index, $event)"
                @remove="removeOperation(index)"
                @move-up="moveOperation(index, -1)"
                @move-down="moveOperation(index, 1)"
              />
            </div>

            <!-- Tlačítko přidat operaci -->
            <button
              type="button"
              class="btn btn-secondary btn-block"
              style="margin-top: 14px;"
              @click="addOperation"
            >
              + Přidat operaci
            </button>
          </section>

          <!-- Tlačítka Uložit / Zrušit -->
          <section class="edit-section edit-footer">
            <button type="submit" class="btn btn-primary btn-block">
              💾 Uložit výkres
            </button>
            <button type="button" class="btn btn-ghost btn-block" @click="handleCancel">
              Zrušit
            </button>
          </section>

        </form>
      </div>
    </main>

    <!-- DIALOG: Zrušit bez uložení -->
    <transition name="fade">
      <div v-if="showCancelDialog" class="modal-overlay" @click.self="showCancelDialog = false">
        <div class="modal">
          <div class="modal__title">Zahodit změny?</div>
          <div class="modal__text">
            Máte neuložené změny. Opravdu chcete odejít bez uložení?
          </div>
          <div class="modal__actions">
            <button class="btn btn-ghost" type="button" @click="showCancelDialog = false">
              Zpět k editaci
            </button>
            <button class="btn btn-danger" type="button" @click="goBack">
              Zahodit
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- DIALOG: Odebrat fotku -->
    <transition name="fade">
      <div v-if="confirmPhotoIdx !== null" class="modal-overlay" @click.self="confirmPhotoIdx = null">
        <div class="modal">
          <div class="modal__title">Odebrat fotku?</div>
          <div class="modal__text">
            Opravdu chcete odebrat tuto fotku výkresu?
          </div>
          <div class="modal__actions">
            <button class="btn btn-ghost" type="button" @click="confirmPhotoIdx = null">
              Zrušit
            </button>
            <button class="btn btn-danger" type="button" @click="doRemovePhoto">
              Odebrat
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- DIALOG: Odebrat operaci -->
    <transition name="fade">
      <div v-if="confirmOpIdx !== null" class="modal-overlay" @click.self="confirmOpIdx = null">
        <div class="modal">
          <div class="modal__title">Smazat operaci?</div>
          <div class="modal__text">
            Opravdu chcete smazat
            <strong>operaci {{ confirmOpIdx !== null ? form.operations[confirmOpIdx]?.operationNumber : '' }}</strong>?
          </div>
          <div class="modal__actions">
            <button class="btn btn-ghost" type="button" @click="confirmOpIdx = null">
              Zrušit
            </button>
            <button class="btn btn-danger" type="button" @click="doRemoveOperation">
              Smazat
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDrawingsStore } from '../stores/drawings.js'
import OperationForm from '../components/OperationForm.vue'

const props = defineProps({
  /** true = nový výkres, false = editace existujícího */
  isNew: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const store = useDrawingsStore()

// Stav dialogu pro zrušení se změnami
const showCancelDialog = ref(false)

// Potvrzení smazání fotky (index nebo null)
const confirmPhotoIdx = ref(null)

// Potvrzení smazání operace (index nebo null)
const confirmOpIdx = ref(null)

// Chybové zprávy validace
const errors = reactive({
  drawingNumber: '',
})

// ID pro nové operace
let opCounter = 0
function newOpId() {
  return `new-op-${Date.now()}-${opCounter++}`
}

/** Vytvoří prázdnou operaci s výchozími hodnotami */
function emptyOperation() {
  return {
    id: newOpId(),
    operationNumber: form.operations.length + 1,
    tool: 'N1',
    feed: 0.05,
    speed: 300,
    potentiometer: 50,
    clampS1: 0.0,
    clampS2: 0.0,
    note: '',
  }
}

// Reaktivní formulářová data
const form = reactive({
  drawingNumber: '',
  photos: [],
  operations: [],
})

// Sleduje, zda byla data změněna (pro potvrzení zrušení)
const isDirty = ref(false)

// Inicializace formuláře
onMounted(() => {
  if (!props.isNew) {
    // Editace: načteme existující výkres
    const drawing = store.getDrawingById(route.params.id)
    if (drawing) {
      form.drawingNumber = drawing.drawingNumber
      form.photos = Array.isArray(drawing.photos) ? [...drawing.photos] : []
      // Hluboká kopie operací, aby editace neměnila store přímo
      form.operations = drawing.operations.map(op => ({ ...op }))
    } else {
      // Výkres neexistuje → zpět na seznam
      router.replace({ name: 'DrawingList' })
    }
  }
  // Povolíme dirty tracking až po načtení
  setTimeout(() => { isDirty.value = false }, 0)
})

// ─── Akce s fotkami ──────────────────────────────────────────────────────────

/**
 * Načte foto přes FileReader a přidá jako base64 do pole fotek.
 */
function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    form.photos.push(e.target.result)
    isDirty.value = true
  }
  reader.readAsDataURL(file)

  // Reset inputu aby šlo vybrat stejný soubor znovu
  event.target.value = ''
}

function removePhoto(index) {
  confirmPhotoIdx.value = index
}

function doRemovePhoto() {
  form.photos.splice(confirmPhotoIdx.value, 1)
  isDirty.value = true
  confirmPhotoIdx.value = null
}

// ─── Akce s operacemi ────────────────────────────────────────────────────────

function addOperation() {
  form.operations.push(emptyOperation())
  isDirty.value = true
}

function updateOperation(index, updatedOp) {
  form.operations[index] = updatedOp
  isDirty.value = true
}

function removeOperation(index) {
  confirmOpIdx.value = index
}

function doRemoveOperation() {
  form.operations.splice(confirmOpIdx.value, 1)
  form.operations.forEach((op, i) => { op.operationNumber = i + 1 })
  isDirty.value = true
  confirmOpIdx.value = null
}

/** Přesune operaci na indexu +direction (-1 = nahoru, +1 = dolů) */
function moveOperation(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= form.operations.length) return

  const ops = form.operations
  const temp = ops[index]
  ops[index] = ops[targetIndex]
  ops[targetIndex] = temp

  // Přečíslujeme
  ops.forEach((op, i) => { op.operationNumber = i + 1 })
  isDirty.value = true
}

// ─── Validace ────────────────────────────────────────────────────────────────

function validate() {
  errors.drawingNumber = ''
  let valid = true

  if (!form.drawingNumber) {
    errors.drawingNumber = 'Číslo výkresu je povinné.'
    valid = false
  }

  return valid
}

// ─── Uložení ─────────────────────────────────────────────────────────────────

function saveDrawing() {
  if (!validate()) return

  const drawingData = {
    drawingNumber: form.drawingNumber,
    photos: form.photos,
    operations: form.operations,
  }

  let targetId
  if (props.isNew) {
    targetId = store.addDrawing(drawingData)
  } else {
    store.updateDrawing(route.params.id, drawingData)
    targetId = route.params.id
  }

  isDirty.value = false
  router.push({ name: 'DrawingDetail', params: { id: targetId } })
}

// ─── Zrušení ─────────────────────────────────────────────────────────────────

function handleCancel() {
  if (isDirty.value) {
    showCancelDialog.value = true
  } else {
    goBack()
  }
}

function goBack() {
  showCancelDialog.value = false
  if (props.isNew) {
    router.push({ name: 'DrawingList' })
  } else {
    router.push({ name: 'DrawingDetail', params: { id: route.params.id } })
  }
}
</script>

<style scoped>
.edit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Sekce formuláře */
.edit-section {
  margin-bottom: 24px;
}

/* Počet operací v nadpisu sekce */
.section-title__count {
  font-weight: 400;
  color: var(--text-muted);
}

/* Chybová zpráva */
.form-control--error {
  border-color: var(--danger) !important;
}

.form-error {
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
}

/* Mřížka fotek */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photos-grid__item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
}

.photos-grid__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photos-grid__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.photos-grid__badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: var(--accent);
  color: #1a1a2e;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  letter-spacing: 0.3px;
}

/* Skrytý file input */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Seznam operací */
.ops-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ops-empty {
  background: var(--bg-secondary);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.ops-empty__text {
  color: var(--text-muted);
  font-size: 14px;
}

/* Footer tlačítka */
.edit-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
}
</style>
