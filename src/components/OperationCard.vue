<template>
  <!-- Karta operace – zobrazení v detailu výkresu (read-only) -->
  <div class="op-card">
    <!-- Hlavička operace: typ operace (prominentně) nebo fallback "Operace N" -->
    <div class="op-card__header">
      <div class="op-card__header-left">
        <span v-if="operation.operationType" class="op-card__type">
          {{ operation.operationType }}
        </span>
        <span v-else class="op-card__number">Operace {{ operation.operationNumber }}</span>
      </div>
      <span class="op-card__tool">{{ operation.tool }}</span>
    </div>

    <!-- Parametry operace v mřížce -->
    <div class="op-card__params">
      <div class="op-card__param">
        <span class="op-card__param-label">Posuv F</span>
        <span class="op-card__param-value">{{ formatFeed(operation.feed) }} <span class="op-card__unit">mm/ot</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Otáčky S</span>
        <span class="op-card__param-value">{{ operation.speed }} <span class="op-card__unit">ot/min</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Potenciometr P</span>
        <span class="op-card__param-value">{{ operation.potentiometer }} <span class="op-card__unit">%</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Spona Š1</span>
        <span class="op-card__param-value">{{ formatClamp(operation.clampS1) }} <span class="op-card__unit">mm</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Spona Š2</span>
        <span class="op-card__param-value">{{ formatClamp(operation.clampS2) }} <span class="op-card__unit">mm</span></span>
      </div>
    </div>

    <!-- Poznámka (zobrazí se jen pokud existuje) -->
    <div v-if="operation.note" class="op-card__note">
      <span class="op-card__note-label">Poznámka:</span>
      {{ operation.note }}
    </div>
  </div>
</template>

<script setup>
// OperationCard.vue – zobrazení jedné operace v detailu výkresu (read-only)

defineProps({
  operation: {
    type: Object,
    required: true,
  },
})

/** Formátuje posuv na 2 desetinná místa */
function formatFeed(val) {
  return Number(val).toFixed(2)
}

/** Formátuje sponu na 1 desetinné místo */
function formatClamp(val) {
  return Number(val).toFixed(1)
}
</script>

<style scoped>
.op-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 14px;
}

.op-card + .op-card {
  margin-top: 10px;
}

/* Hlavička */
.op-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.op-card__header-left {
  flex: 1;
  min-width: 0;
}

/* Prominentní typ operace – zobrazí se místo "Operace N" když je vyplněn */
.op-card__type {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fallback "Operace N" – zobrazí se pokud typ není vyplněn */
.op-card__number {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.op-card__tool {
  background: var(--bg-card);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

/* Parametry v mřížce */
.op-card__params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.op-card__param {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.op-card__param-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 600;
}

.op-card__param-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.op-card__unit {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Poznámka */
.op-card__note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.op-card__note-label {
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-right: 4px;
}
</style>
