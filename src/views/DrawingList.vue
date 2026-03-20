<template>
  <div class="list-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="app-header__inner">
        <span class="app-header__title">
          ⚙ Soustružník DB
          <small class="app-header__subtitle"> v1.0</small>
        </span>
      </div>
    </header>

    <!-- OBSAH -->
    <main class="page-content">
      <div class="container">

        <!-- Vyhledávací pole -->
        <div class="search-wrapper" style="margin-bottom: 16px;">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="search"
            class="form-control"
            placeholder="Hledat číslo výkresu…"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <button
            v-if="searchQuery"
            class="search-clear"
            type="button"
            @click="searchQuery = ''"
            aria-label="Vymazat hledání"
          >✕</button>
        </div>

        <!-- Počet výsledků (pokud se vyhledává) -->
        <div v-if="searchQuery" class="results-info">
          Nalezeno: <strong>{{ filteredDrawings.length }}</strong>
          {{ filteredDrawings.length === 1 ? 'výkres' : filteredDrawings.length <= 4 ? 'výkresy' : 'výkresů' }}
        </div>

        <!-- Seznam výkresů -->
        <div v-if="filteredDrawings.length > 0" class="drawings-list">
          <DrawingCard
            v-for="drawing in filteredDrawings"
            :key="drawing.id"
            :drawing="drawing"
            @click="goToDetail(drawing.id)"
          />
        </div>

        <!-- Prázdný stav – žádné výsledky vyhledávání -->
        <div v-else-if="searchQuery" class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">Nic nenalezeno</div>
          <div class="empty-state__text">
            Výkres s číslem „{{ searchQuery }}" neexistuje.<br />
            Zkuste jiné číslo nebo vytvořte nový výkres.
          </div>
        </div>

        <!-- Prázdný stav – žádné výkresy vůbec -->
        <div v-else class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">Žádné výkresy</div>
          <div class="empty-state__text">
            Zatím nemáte žádné uložené výkresy.<br />
            Klepněte na <strong>+</strong> a vytvořte první záznam.
          </div>
        </div>

      </div>
    </main>

    <!-- FAB – tlačítko pro nový výkres -->
    <button
      class="fab"
      type="button"
      aria-label="Přidat nový výkres"
      title="Nový výkres"
      @click="goToNew"
    >+</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDrawingsStore } from '../stores/drawings.js'
import DrawingCard from '../components/DrawingCard.vue'

const router = useRouter()
const store = useDrawingsStore()

// Vyhledávací dotaz
const searchQuery = ref('')

// Filtrované výkresy (reaguje na searchQuery)
const filteredDrawings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const all = store.getAllDrawings()
  if (!q) return all
  return all.filter(d =>
    d.drawingNumber.toLowerCase().includes(q)
  )
})

function goToDetail(id) {
  router.push({ name: 'DrawingDetail', params: { id } })
}

function goToNew() {
  router.push({ name: 'DrawingNew' })
}
</script>

<style scoped>
.list-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.drawings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-info {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
</style>
