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
      <span class="op-card__tool">{{ toolLabel }}</span>
    </div>

    <!-- Parametry operace v mřížce -->
    <div class="op-card__params">
      <div class="op-card__param">
        <span class="op-card__param-label">Posuv F</span>
        <span class="op-card__param-value">{{ operation.feed }}</span>
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
        <span class="op-card__param-value">{{ operation.clampS1 }} <span class="op-card__unit">mm</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Spona Š2</span>
        <span class="op-card__param-value">{{ operation.clampS2 }} <span class="op-card__unit">mm</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Příprava</span>
        <span class="op-card__param-value">{{ operation.prepTime ?? 0 }} <span class="op-card__unit">min</span></span>
      </div>
      <div class="op-card__param">
        <span class="op-card__param-label">Výroba</span>
        <span class="op-card__param-value">{{ operation.prodTime ?? 0 }} <span class="op-card__unit">min</span></span>
      </div>
    </div>

    <!-- Poznámka (zobrazí se jen pokud existuje) -->
    <div v-if="operation.note" class="op-card__note">
      <span class="op-card__note-label">Poznámka:</span>
      {{ operation.note }}
    </div>

    <!-- Fotky operace -->
    <div v-if="operation.photos && operation.photos.length" class="op-card__photos">
      <div class="op-card__photos-strip">
        <div
          v-for="(photo, idx) in operation.photos"
          :key="idx"
          class="op-card__photo-thumb"
          @click="openFullscreen(idx)"
        >
          <img :src="photo" :alt="`Fotka ${idx + 1}`" class="op-card__photo-img" />
          <div class="op-card__photo-hint">🔍</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen galerie fotek operace -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="fullscreen.open"
        class="op-fullscreen"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <button class="op-fullscreen__close" @click="fullscreen.open = false" aria-label="Zavřít">✕</button>
        <div v-if="operation.photos.length > 1" class="op-fullscreen__counter">
          {{ fullscreen.index + 1 }} / {{ operation.photos.length }}
        </div>
        <img
          :src="operation.photos[fullscreen.index]"
          :alt="`Fotka ${fullscreen.index + 1}`"
          @click="fullscreen.open = false"
        />
        <button
          v-if="fullscreen.index > 0"
          class="op-fullscreen__arrow op-fullscreen__arrow--left"
          @click.stop="fullscreen.index--"
          aria-label="Předchozí"
        >‹</button>
        <button
          v-if="fullscreen.index < operation.photos.length - 1"
          class="op-fullscreen__arrow op-fullscreen__arrow--right"
          @click.stop="fullscreen.index++"
          aria-label="Další"
        >›</button>
        <div v-if="operation.photos.length > 1" class="op-fullscreen__dots">
          <span
            v-for="(_, i) in operation.photos"
            :key="i"
            class="op-fullscreen__dot"
            :class="{ 'op-fullscreen__dot--active': i === fullscreen.index }"
            @click.stop="fullscreen.index = i"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// OperationCard.vue – zobrazení jedné operace v detailu výkresu (read-only)

import { computed, reactive } from 'vue'
import { useToolsStore } from '../stores/tools.js'

const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
})

const toolsStore = useToolsStore()

const fullscreen = reactive({ open: false, index: 0 })

function openFullscreen(idx) {
  fullscreen.index = idx
  fullscreen.open = true
}

let touchStartX = 0
function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const len = props.operation.photos?.length ?? 0
  if (dx < -50 && fullscreen.index < len - 1) fullscreen.index++
  else if (dx > 50 && fullscreen.index > 0) fullscreen.index--
}

const toolLabel = computed(() => {
  const id = props.operation.tool
  if (!id) return ''
  const tool = toolsStore.tools.find(t => t.id === id)
  const name = tool?.name?.trim()
  return name ? `${id} - ${name}` : id
})


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

/* Fotky operace */
.op-card__photos {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.op-card__photos-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}
.op-card__photos-strip::-webkit-scrollbar { height: 3px; }
.op-card__photo-thumb {
  flex-shrink: 0;
  position: relative;
  width: 100px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: zoom-in;
  background: var(--bg-secondary);
}
.op-card__photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.op-card__photo-hint {
  position: absolute;
  top: 4px;
  right: 5px;
  font-size: 13px;
  opacity: 0.75;
}

/* Fullscreen galerie fotek operace */
.op-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}
.op-fullscreen img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-out;
}
.op-fullscreen__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.op-fullscreen__counter {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  font-weight: 600;
}
.op-fullscreen__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.op-fullscreen__arrow--left { left: 12px; }
.op-fullscreen__arrow--right { right: 12px; }
.op-fullscreen__dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}
.op-fullscreen__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
}
.op-fullscreen__dot--active { background: #fff; }

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
