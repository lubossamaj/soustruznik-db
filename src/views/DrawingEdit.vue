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

          <!-- SEKCE: Fotka výkresu -->
          <section class="edit-section">
            <div class="section-title">Fotka výkresu</div>

            <!-- Aktuální fotka -->
            <div v-if="form.photo" class="photo-current">
              <img :src="form.photo" alt="Výkres" class="photo-preview" />
              <div class="photo-current__actions">
                <label class="btn btn-secondary btn-block" style="cursor:pointer;">
                  📷 Změnit fotku
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="sr-only"
                    @change="handlePhotoChange"
                  />
                </label>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  @click="removePhoto"
                >Odebrat fotku</button>
              </div>
            </div>

            <!-- Placeholder – bez fotky -->
            <div v-else>
              <div class="photo-placeholder" style="margin-bottom: 12px;">
                <span class="photo-placeholder__icon">📷</span>
                <span>Žádná fotka</span>
              </div>
              <label class="btn btn-secondary btn-block" style="cursor:pointer;">
                📷 Vyfotit výkres
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  class="sr-only"
                  @change="handlePhotoChange"
                />
              </label>
            </div>
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
    tool: 'T1',
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
  photo: null,
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
      form.photo = drawing.photo
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

// ─── Akce s fotkou ───────────────────────────────────────────────────────────

/**
 * Načte foto přes FileReader a uloží jako base64.
 */
function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    form.photo = e.target.result
    isDirty.value = true
  }
  reader.readAsDataURL(file)

  // Reset inputu aby šlo vybrat stejný soubor znovu
  event.target.value = ''
}

function removePhoto() {
  form.photo = null
  isDirty.value = true
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
  form.operations.splice(index, 1)
  // Přečíslujeme operace
  form.operations.forEach((op, i) => { op.operationNumber = i + 1 })
  isDirty.value = true
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
    photo: form.photo,
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
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
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

/* Fotka – aktuální */
.photo-current {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-current__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
