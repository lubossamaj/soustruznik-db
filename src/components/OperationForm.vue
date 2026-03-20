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

      <!-- Nástroj T1–T20 -->
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

    </div>
  </div>
</template>

<script setup>
// OperationForm.vue – formulář pro jednu operaci v editaci výkresu

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

// Seznam nástrojů T1–T20
const tools = Array.from({ length: 20 }, (_, i) => `T${i + 1}`)

// Hodnoty potenciometru
const potentiometerValues = [0, 2, 4, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]

/** Parsuje desetinné číslo – přijímá tečku i čárku jako oddělovač */
function parseDecimal(val) {
  return parseFloat(String(val).replace(',', '.')) || 0
}

/**
 * Emituje aktualizaci jednoho pole operace.
 * Rodič DrwingEdit dostane celý aktualizovaný objekt operace.
 */
function update(field, value) {
  emit('update', { ...props.operation, [field]: value })
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
