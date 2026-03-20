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

        <!-- Fotka výkresu -->
        <section class="detail-section">
          <div class="section-title">Fotka výkresu</div>
          <div v-if="drawing.photo" class="photo-wrapper" @click="showFullscreen = true">
            <img
              :src="drawing.photo"
              :alt="`Výkres ${drawing.drawingNumber}`"
              class="photo-preview"
            />
            <div class="photo-hint">Klepněte pro zvětšení</div>
          </div>
          <div v-else class="photo-placeholder">
            <span class="photo-placeholder__icon">📷</span>
            <span>Bez fotky</span>
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

    <!-- FULLSCREEN FOTKA -->
    <transition name="fade">
      <div
        v-if="showFullscreen && drawing?.photo"
        class="photo-fullscreen"
        @click="showFullscreen = false"
        role="dialog"
        aria-label="Fullscreen fotka výkresu"
      >
        <img :src="drawing.photo" :alt="`Výkres ${drawing.drawingNumber}`" />
        <div class="photo-fullscreen__hint">Klepněte pro zavření</div>
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

/* Fotka s hover efektem */
.photo-wrapper {
  cursor: zoom-in;
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
}

.photo-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  text-align: center;
  padding: 20px 8px 8px;
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

/* Fullscreen hint */
.photo-fullscreen__hint {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}
</style>
