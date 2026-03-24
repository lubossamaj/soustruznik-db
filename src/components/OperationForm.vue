<template>
  <!-- Formulář pro jednu operaci v editaci výkresu -->
  <div class="op-form">
    <!-- Hlavička s číslem operace a tlačítky přesunu/smazání -->
    <div class="op-form__header">
      <span class="op-form__title">Operace {{ index + 1 }}</span>
      <div class="op-form__actions">
        <!-- Přesunout nahoru -->
        <button
          type="button"
          class="btn btn-icon"
          :disabled="index === 0"
          title="Přesunout nahoru"
          @click="$emit('move-up')"
        >↑</button>
        <!-- Přesunout dolů -->
        <button
          type="button"
          class="btn btn-icon"
          :disabled="index === total - 1"
          title="Přesunout dolů"
          @click="$emit('move-down')"
        >↓</button>
        <!-- Smazat operaci -->
        <button
          type="button"
          class="btn btn-icon btn-icon--danger"
          title="Smazat operaci"
          @click="$emit('remove')"
        >🗑</button>
      </div>
    </div>

    <!-- Formulářová pole -->
    <div class="op-form__body">

      <!-- Typ obráběcí operace – první pole -->
      <div class="form-group">
        <label class="form-label">Typ operace <span>*</span></label>
        <select
          class="form-control"
          :value="operation.operationType"
          @change="update('operationType', $event.target.value)"
        >
          <option value="" disabled>— vyberte typ —</option>
          <option v-for="t in operationTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <!-- Nástroj N1–N30 -->
      <div class="form-group">
        <label class="form-label">Nástroj <span>*</span></label>
        <select
          class="form-control"
          :value="operation.tool"
          @change="update('tool', $event.target.value)"
        >
          <option v-for="t in tools" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <!-- Posuv F a Otáčky S – vedle sebe -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Posuv F <span>*</span></label>
          <input
            type="text"
            inputmode="decimal"
            class="form-control"
            :value="operation.feed"
            @change="update('feed', parseDecimal($event.target.value))"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Otáčky S <span>*</span></label>
          <input
            type="number"
            class="form-control"
            :value="operation.speed"
            min="0"
            max="1500"
            step="1"
            inputmode="numeric"
            @input="update('speed', parseInt($event.target.value) || 0)"
          />
          <div class="form-unit">ot/min</div>
        </div>
      </div>

      <!-- Potenciometr P -->
      <div class="form-group">
        <label class="form-label">Potenciometr P <span>*</span></label>
        <select
          class="form-control"
          :value="operation.potentiometer"
          @change="update('potentiometer', parseInt($event.target.value))"
        >
          <option v-for="p in potentiometerValues" :key="p" :value="p">{{ p }} %</option>
        </select>
      </div>

      <!-- Spona Š1 a Š2 – vedle sebe -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Spona Š1</label>
          <input
            type="text"
            inputmode="decimal"
            class="form-control"
            :value="operation.clampS1"
            @change="update('clampS1', parseDecimal($event.target.value))"
          />
          <div class="form-unit">mm</div>
        </div>
        <div class="form-group">
          <label class="form-label">Spona Š2</label>
          <input
            type="text"
            inputmode="decimal"
            class="form-control"
            :value="operation.clampS2"
            @change="update('clampS2', parseDecimal($event.target.value))"
          />
          <div class="form-unit">mm</div>
        </div>
      </div>

      <!-- Příprava a Výroba – časy v minutách -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Příprava</label>
          <input
            type="number"
            class="form-control"
            :value="operation.prepTime"
            min="0"
            step="1"
            inputmode="numeric"
            @input="update('prepTime', parseFloat($event.target.value) || 0)"
          />
          <div class="form-unit">min</div>
        </div>
        <div class="form-group">
          <label class="form-label">Výroba</label>
          <input
            type="number"
            class="form-control"
            :value="operation.prodTime"
            min="0"
            step="1"
            inputmode="numeric"
            @input="update('prodTime', parseFloat($event.target.value) || 0)"
          />
          <div class="form-unit">min</div>
        </div>
      </div>

      <!-- Poznámka -->
      <div class="form-group">
        <label class="form-label">Poznámka</label>
        <textarea
          class="form-control"
          :value="operation.note"
          placeholder="Volná poznámka k operaci (nepovinné)…"
          rows="2"
          @input="update('note', $event.target.value)"
        ></textarea>
      </div>

      <!-- Fotky operace -->
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">
          Fotky operace
          <span v-if="operation.photos && operation.photos.length" style="font-weight:400;color:var(--text-muted)">({{ operation.photos.length }})</span>
        </label>
        <div v-if="operation.photos && operation.photos.length" class="photos-grid">
          <div
            v-for="(photo, idx) in operation.photos"
            :key="idx"
            class="photos-grid__item"
          >
            <img :src="photo" :alt="`Fotka ${idx + 1}`" class="photos-grid__img" />
            <button
              type="button"
              class="photos-grid__remove"
              @click="removeOpPhoto(idx)"
              aria-label="Odebrat fotku"
            >✕</button>
            <span v-if="idx === 0" class="photos-grid__badge">Náhled</span>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <label class="btn btn-secondary" style="cursor:pointer; flex:1;">
            📷 Fotoaparát
            <input type="file" accept="image/*" capture="environment" class="sr-only" @change="handleOpPhoto" />
          </label>
          <label class="btn btn-secondary" style="cursor:pointer; flex:1;">
            🖼️ Galerie
            <input type="file" accept="image/*" class="sr-only" @change="handleOpPhoto" />
          </label>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// OperationForm.vue – formulář pro jednu operaci v editaci výkresu
import { computed } from 'vue'
import { useToolsStore } from '../stores/tools.js'
const toolsStore = useToolsStore()

const props = defineProps({
  /** Objekt operace s hodnotami polí */
  operation: {
    type: Object,
    required: true,
  },
  /** Index operace v poli (0-based) */
  index: {
    type: Number,
    required: true,
  },
  /** Celkový počet operací */
  total: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update', 'remove', 'move-up', 'move-down'])

// Typy obráběcích operací
const operationTypes = [
  'Podélné soustružení',
  'Čelní soustružení',
  'Zapichovací soustružení',
  'Závit vnější',
  'Závit vnitřní',
  'Vrtání',
  'Vystružování',
  'Vyvrtávání',
  'Upichování',
  'Kopírovací soustružení',
  'Hrubování',
  'Dokončování',
]

// Seznam nástrojů z live dat (reaguje na přidání/odebrání nástrojů)
const tools = computed(() => toolsStore.tools.map(t => t.id))

// Hodnoty potenciometru
const potentiometerValues = [0, 2, 4, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]

/** Parsuje desetinné číslo – přijímá tečku i čárku jako oddělovač */
function parseDecimal(val) {
  return parseFloat(String(val).replace(',', '.')) || 0
}

/**
 * Emituje aktualizaci jednoho pole operace.
 * Rodič DrawingEdit dostane celý aktualizovaný objekt operace.
 */
function update(field, value) {
  emit('update', { ...props.operation, [field]: value })
}

function compressImage(dataUrl, maxSize = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width >= height) { height = Math.round(height * maxSize / width); width = maxSize }
        else { width = Math.round(width * maxSize / height); height = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

async function handleOpPhoto(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const compressed = await compressImage(e.target.result)
    const photos = [...(props.operation.photos ?? []), compressed]
    emit('update', { ...props.operation, photos })
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

function removeOpPhoto(idx) {
  const photos = (props.operation.photos ?? []).filter((_, i) => i !== idx)
  emit('update', { ...props.operation, photos })
}
</script>

<style scoped>
.op-form {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  overflow: hidden;
}

/* Hlavička */
.op-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.op-form__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.op-form__actions {
  display: flex;
  gap: 6px;
}

.btn-icon--danger {
  color: var(--danger) !important;
  border-color: var(--danger) !important;
}

.btn-icon--danger:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.15);
}

/* Mřížka fotek operace */
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
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* Tělo formuláře */
.op-form__body {
  padding: 14px;
}

.op-form__body .form-group {
  margin-bottom: 14px;
}

.op-form__body .form-group:last-child {
  margin-bottom: 0;
}
</style>
