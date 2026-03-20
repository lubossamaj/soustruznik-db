<template>
  <!-- Karta výkresu v seznamu – kliknutím přechod na detail -->
  <div class="drawing-card" @click="$emit('click')" role="button" tabindex="0"
       @keydown.enter="$emit('click')">
    <!-- Náhled fotky nebo placeholder -->
    <div class="drawing-card__photo">
      <img
        v-if="drawing.photo"
        :src="drawing.photo"
        :alt="`Výkres ${drawing.drawingNumber}`"
        class="drawing-card__img"
      />
      <div v-else class="drawing-card__no-photo">
        <span class="drawing-card__no-photo-icon">📄</span>
      </div>
    </div>

    <!-- Informace o výkresu -->
    <div class="drawing-card__info">
      <div class="drawing-card__number">{{ drawing.drawingNumber }}</div>
      <div class="drawing-card__meta">
        <span class="drawing-card__ops">
          {{ drawing.operations.length }}
          {{ opsLabel(drawing.operations.length) }}
        </span>
        <span class="drawing-card__date">{{ formatDate(drawing.updatedAt) }}</span>
      </div>
    </div>

    <!-- Šipka vpřed -->
    <div class="drawing-card__arrow">›</div>
  </div>
</template>

<script setup>
// DrawingCard.vue – karta výkresu v seznamu

defineProps({
  drawing: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

/** Správná česká koncovka pro počet operací */
function opsLabel(count) {
  if (count === 1) return 'operace'
  if (count >= 2 && count <= 4) return 'operace'
  return 'operací'
}

/** Formátuje datum na čitelný tvar */
function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.drawing-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.drawing-card:active {
  background-color: #1a3a70;
  border-color: var(--accent);
}

/* Fotka */
.drawing-card__photo {
  flex-shrink: 0;
  width: 72px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.drawing-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawing-card__no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawing-card__no-photo-icon {
  font-size: 28px;
  opacity: 0.4;
}

/* Text */
.drawing-card__info {
  flex: 1;
  min-width: 0;
}

.drawing-card__number {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.drawing-card__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.drawing-card__ops {
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  background: var(--accent-light);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-accent);
}

.drawing-card__date {
  font-size: 12px;
  color: var(--text-muted);
}

/* Šipka */
.drawing-card__arrow {
  font-size: 24px;
  color: var(--text-muted);
  flex-shrink: 0;
  padding-right: 4px;
}
</style>
