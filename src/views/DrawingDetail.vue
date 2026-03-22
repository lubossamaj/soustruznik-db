<template>
  <div class="detail-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="app-header__inner">
        <button class="app-header__back" type="button" @click="goBack" aria-label="Zpět">‹</button>
        <span class="app-header__title">Výkres č. {{ drawing?.drawingNumber ?? '…' }}</span>
      </div>
    </header>

    <!-- LOADING / NOT FOUND -->
    <main class="page-content" v-if="!drawing">
      <div class="container">
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <div class="empty-state__title">Výkres nenalezen</div>
          <div class="empty-state__text">Tento výkres neexistuje nebo byl smazán.</div>
          <br />
          <button class="btn btn-secondary" @click="goBack">← Zpět na seznam</button>
        </div>
      </div>
    </main>

    <!-- DETAIL VÝKRESU -->
    <main class="page-content" v-else>
      <div class="container">

        <!-- Fotky výkresu -->
        <section v-if="drawing.photos && drawing.photos.length > 0" class="detail-section">
          <div class="section-title">
            Fotky výkresu
            <span v-if="drawing.photos.length > 1" class="section-title__count">({{ drawing.photos.length }})</span>
          </div>
          <div class="photos-strip">
            <div
              v-for="(photo, idx) in drawing.photos"
              :key="idx"
              class="photos-strip__item"
              @click="openFullscreen(idx)"
            >
              <img :src="photo" :alt="`Fotka ${idx + 1}`" class="photos-strip__img" />
              <div class="photos-strip__hint">🔍</div>
            </div>
          </div>
        </section>

        <!-- Metadata -->
        <section class="detail-section">
          <div class="detail-meta">
            <div class="detail-meta__item">
              <span class="detail-meta__label">Číslo výkresu</span>
              <span class="detail-meta__value">{{ drawing.drawingNumber }}</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__label">Počet operací</span>
              <span class="detail-meta__value">{{ drawing.operations.length }}</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__label">Naposledy upraveno</span>
              <span class="detail-meta__value">{{ formatDate(drawing.updatedAt) }}</span>
            </div>
          </div>
        </section>

        <!-- Operace -->
        <section class="detail-section">
          <div class="section-title">
            Technologický postup ({{ drawing.operations.length }} operací)
          </div>

          <div v-if="drawing.operations.length > 0" class="ops-list">
            <div
              v-for="op in drawing.operations"
              :key="op.id"
              class="op-group"
            >
              <!-- Nadpis operace: "1. Podélné soustružení" nebo "Operace 1" -->
              <div class="op-group__heading">
                {{ op.operationType
                    ? `${op.operationNumber}. ${op.operationType}`
                    : `Operace ${op.operationNumber}` }}
              </div>
              <OperationCard :operation="op" />
            </div>
          </div>
          <div v-else class="empty-state" style="padding: 24px;">
            <div class="empty-state__text">Žádné operace nebyly zadány.</div>
          </div>
        </section>

        <!-- Akce -->
        <section class="detail-section detail-actions">
          <button class="btn btn-secondary btn-block" type="button" @click="goToEdit">
            ✏️ Upravit výkres
          </button>
          <button class="btn btn-danger btn-block" type="button" @click="confirmDelete = true">
            🗑 Smazat výkres
          </button>
        </section>

      </div>
    </main>

    <!-- FULLSCREEN GALERIE -->
    <transition name="fade">
      <div
        v-if="showFullscreen"
        class="photo-fullscreen"
        role="dialog"
        aria-label="Galerie fotek výkresu"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <!-- Křížek zavřít -->
        <button class="photo-fullscreen__close" @click="showFullscreen = false" aria-label="Zavřít">✕</button>

        <!-- Počítadlo -->
        <div v-if="drawing.photos.length > 1" class="photo-fullscreen__counter">
          {{ fullscreenIndex + 1 }} / {{ drawing.photos.length }}
        </div>

        <!-- Fotka -->
        <img
          :src="drawing.photos[fullscreenIndex]"
          :alt="`Fotka ${fullscreenIndex + 1}`"
          @click="showFullscreen = false"
        />

        <!-- Šipka vlevo -->
        <button
          v-if="drawing.photos.length > 1 && fullscreenIndex > 0"
          class="photo-fullscreen__arrow photo-fullscreen__arrow--left"
          @click.stop="fullscreenIndex--"
          aria-label="Předchozí fotka"
        >‹</button>

        <!-- Šipka vpravo -->
        <button
          v-if="drawing.photos.length > 1 && fullscreenIndex < drawing.photos.length - 1"
          class="photo-fullscreen__arrow photo-fullscreen__arrow--right"
          @click.stop="fullscreenIndex++"
          aria-label="Další fotka"
        >›</button>

        <!-- Tečky -->
        <div v-if="drawing.photos.length > 1" class="photo-fullscreen__dots">
          <span
            v-for="(_, i) in drawing.photos"
            :key="i"
            class="photo-fullscreen__dot"
            :class="{ 'photo-fullscreen__dot--active': i === fullscreenIndex }"
            @click.stop="fullscreenIndex = i"
          />
        </div>
      </div>
    </transition>

    <!-- POTVRZOVACÍ DIALOG SMAZÁNÍ -->
    <transition name="fade">
      <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = false">
        <div class="modal">
          <div class="modal__title">Smazat výkres?</div>
          <div class="modal__text">
            Opravdu chcete smazat výkres č. <strong>{{ drawing?.drawingNumber }}</strong>
            včetně všech operací? Tuto akci nelze vrátit zpět.
          </div>
          <div class="modal__actions">
            <button class="btn btn-ghost" type="button" @click="confirmDelete = false">
              Zrušit
            </button>
            <button class="btn btn-danger" type="button" @click="deleteDrawing">
              Smazat
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDrawingsStore } from '../stores/drawings.js'
import OperationCard from '../components/OperationCard.vue'

const route = useRoute()
const router = useRouter()
const store = useDrawingsStore()

// Načtení výkresu dle ID z URL
const drawing = computed(() => store.getDrawingById(route.params.id))

// Stav zobrazení fullscreen fotky
const showFullscreen = ref(false)
const fullscreenIndex = ref(0)

function openFullscreen(idx) {
  fullscreenIndex.value = idx
  showFullscreen.value = true
}

// Swipe gesta
let touchStartX = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const photos = drawing.value?.photos ?? []
  if (dx < -50 && fullscreenIndex.value < photos.length - 1) {
    fullscreenIndex.value++
  } else if (dx > 50 && fullscreenIndex.value > 0) {
    fullscreenIndex.value--
  }
}

// Stav potvrzovacího dialogu smazání
const confirmDelete = ref(false)

function goBack() {
  router.push({ name: 'DrawingList' })
}

function goToEdit() {
  router.push({ name: 'DrawingEdit', params: { id: route.params.id } })
}

function deleteDrawing() {
  store.deleteDrawing(route.params.id)
  router.push({ name: 'DrawingList' })
}

/** Formátuje ISO datum na čitelný tvar */
function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Sekce v detailu */
.detail-section {
  margin-bottom: 20px;
}

/* Pás fotek */
.photos-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.photos-strip::-webkit-scrollbar {
  height: 3px;
}

.photos-strip__item {
  flex-shrink: 0;
  position: relative;
  width: 160px;
  height: 120px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: zoom-in;
  background: var(--bg-secondary);
}

.photos-strip__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photos-strip__hint {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 16px;
  opacity: 0.7;
}

/* Nadpis sekce – počet */
.section-title__count {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
}

/* Metadata */
.detail-meta {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.detail-meta__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.detail-meta__item + .detail-meta__item {
  border-top: 1px solid var(--border);
}

.detail-meta__label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.detail-meta__value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
}

/* Akce tlačítka */
.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
}

/* Skupiny operací */
.ops-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.op-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.op-group + .op-group {
  margin-top: 14px;
}

/* Nadpis operace: "1. Podélné soustružení" */
.op-group__heading {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding-left: 4px;
  border-left: 3px solid var(--accent);
  padding-left: 8px;
  line-height: 1.3;
}

/* Fullscreen – křížek */
.photo-fullscreen__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;
}

/* Fullscreen – počítadlo */
.photo-fullscreen__counter {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
}

/* Fullscreen – šipky */
.photo-fullscreen__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 64px;
  background: rgba(0,0,0,0.4);
  border: none;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  -webkit-tap-highlight-color: transparent;
  z-index: 10;
}

.photo-fullscreen__arrow--left  { left: 8px; }
.photo-fullscreen__arrow--right { right: 8px; }

/* Fullscreen – tečky */
.photo-fullscreen__dots {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.photo-fullscreen__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: background 0.2s;
}

.photo-fullscreen__dot--active {
  background: #fff;
}
</style>
