/**
 * drawings.js – Pinia store pro správu výkresů
 *
 * Datová vrstva: Firebase Firestore (bez Firebase Storage)
 *
 * Architektura:
 * - Firestore kolekce "drawings" uchovává metadata, operace i fotky
 * - Fotky jsou komprimovány Canvas API (max 800px / JPEG kvalita 0.7)
 *   a uloženy jako base64 data URL přímo v dokumentu Firestore
 * - onSnapshot zajišťuje real-time synchronizaci mezi zařízeními
 * - Optimistic updates: změny se promítnou lokálně okamžitě,
 *   Firestore zápis probíhá asynchronně na pozadí
 * - Offline persistence přes IndexedDB (nastavena v firebase.js)
 *
 * Poznámka k velikosti dokumentu:
 * - Firestore limit: 1 MiB / dokument
 * - Komprimovaný snímek 800px / JPEG 0.7 ≈ 50–200 KB base64
 * - Při fotkách blížících se limitu Firestore zápis selže – v takovém
 *   případě zkuste menší rozlišení fotky nebo jiný záběr.
 *
 * Veřejné API je záměrně synchronní (tam kde je to možné),
 * aby nebylo nutné měnit Vue komponenty.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

// Název Firestore kolekce
const COL = 'drawings'

// ─── Vzorová data (pro první spuštění prázdné kolekce) ───────────────────────

const EXAMPLE_DRAWINGS = [
  {
    drawingNumber: '100023',
    photo: null,
    operations: [
      {
        operationNumber: 1,
        operationType: 'Hrubování',
        tool: 'T1',
        feed: 0.03,
        speed: 300,
        potentiometer: 40,
        clampS1: 2.4,
        clampS2: 0.5,
        note: 'Pozor na koník',
      },
      {
        operationNumber: 2,
        operationType: 'Dokončování',
        tool: 'T20',
        feed: 0.10,
        speed: 200,
        potentiometer: 10,
        clampS1: 1.5,
        clampS2: 0.3,
        note: 'Při průměru 10mm uber na 5mm',
      },
    ],
  },
  {
    drawingNumber: '200456',
    photo: null,
    operations: [
      {
        operationNumber: 1,
        operationType: 'Podélné soustružení',
        tool: 'T5',
        feed: 0.05,
        speed: 450,
        potentiometer: 60,
        clampS1: 3.0,
        clampS2: 1.0,
        note: '',
      },
    ],
  },
]

// ─── Pomocné funkce ───────────────────────────────────────────────────────────

/** Generuje unikátní ID pro operace (klientské ID) */
function generateOpId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/**
 * Normalizuje pole operací – zajistí správné typy a přečíslování.
 * @param {Array} ops - vstupní operace
 * @returns {Array} normalizované operace
 */
function normalizeOperations(ops) {
  return ops.map((op, index) => ({
    id:              op.id              || generateOpId(),
    operationNumber: index + 1,
    operationType:   op.operationType  || '',
    tool:            op.tool           || 'T1',
    feed:            parseFloat(op.feed)        || 0,
    speed:           parseInt(op.speed)         || 50,
    potentiometer:   parseInt(op.potentiometer) || 0,
    clampS1:         parseFloat(op.clampS1)     || 0,
    clampS2:         parseFloat(op.clampS2)     || 0,
    note:            op.note           || '',
  }))
}

/**
 * Převede Firestore Timestamp nebo string na ISO string.
 * Vue komponenty vždy dostanou string (jako v původní localStorage verzi).
 */
function toISOString(value) {
  if (!value) return new Date().toISOString()
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  return new Date().toISOString()
}

/**
 * Zkomprimuje fotku pomocí Canvas API.
 *
 * Algoritmus:
 * 1. Načte base64 data URL do HTMLImageElement
 * 2. Přepočítá rozměry tak, aby delší strana nepřekročila maxSize px
 * 3. Vykreslí na canvas s bílým podkladem (pro PNG s průhledností)
 * 4. Exportuje jako JPEG s nastavenou kvalitou
 *
 * @param {string} dataUrl - base64 data URL (výstup FileReaderu)
 * @param {number} maxSize - maximální délka delší strany v px (výchozí 800)
 * @param {number} quality - kvalita JPEG 0–1 (výchozí 0.7)
 * @returns {Promise<string>} zkomprimovaný base64 JPEG data URL
 */
function compressImage(dataUrl, maxSize = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      // Přepočítáme rozměry – zachováme poměr stran
      if (width > maxSize || height > maxSize) {
        if (width >= height) {
          height = Math.round(height * maxSize / width)
          width = maxSize
        } else {
          width = Math.round(width * maxSize / height)
          height = maxSize
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      // Bílý podklad – zajistí správné zobrazení PNG s průhledností po konverzi na JPEG
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      // Pokud se komprese nezdaří, vrátíme originál
      console.warn('Soustružník DB: Komprese fotky selhala, ukládám originál.')
      resolve(dataUrl)
    }

    img.src = dataUrl
  })
}

/**
 * Zpracuje foto před uložením do Firestore:
 * - null → null (bez fotky)
 * - base64 data URL → zkomprimuje přes Canvas API
 *
 * Poznámka: pokud je foto již uloženo jako base64 z Firestore
 * a uživatel ho nezměnil, DrawingEdit předá totéž base64 zpět –
 * v takovém případě ho znovu zkomprimujeme (je to idempotentní,
 * výsledná velikost je srovnatelná).
 *
 * @param {string|null} photo
 * @returns {Promise<string|null>}
 */
async function processPhoto(photo) {
  if (!photo) return null
  return compressImage(photo)
}

// ─── Pinia store ──────────────────────────────────────────────────────────────

export const useDrawingsStore = defineStore('drawings', () => {
  /** Reaktivní seznam výkresů – aktualizován real-time přes onSnapshot */
  const drawings = ref([])

  /** true = čeká se na první odpověď Firestore */
  const loading = ref(true)

  /** Chybová zpráva nebo null */
  const error = ref(null)

  // Příznak aby se vzorová data seedovala jen jednou
  let seeded = false

  // ─── Real-time listener ─────────────────────────────────────────────────────

  const q = query(
    collection(db, COL),
    orderBy('updatedAt', 'desc')
  )

  onSnapshot(
    q,
    async (snapshot) => {
      // Převedeme Firestore dokumenty na plain objekty pro Vue komponenty
      drawings.value = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id:            docSnap.id,
          drawingNumber: data.drawingNumber ?? '',
          photo:         data.photo         ?? null,
          createdAt:     toISOString(data.createdAt),
          updatedAt:     toISOString(data.updatedAt),
          operations:    Array.isArray(data.operations) ? data.operations : [],
        }
      })

      loading.value = false

      // Pokud je kolekce prázdná při prvním načtení → seedujeme vzorová data
      if (!seeded && snapshot.empty) {
        seeded = true
        await seedExampleData()
      }
    },
    (err) => {
      console.error('Soustružník DB: Chyba Firestore onSnapshot:', err)
      error.value = err.message
      loading.value = false
    }
  )

  // ─── Seeding vzorových dat ──────────────────────────────────────────────────

  /**
   * Přidá vzorové výkresy do prázdné Firestore kolekce.
   * Volá se automaticky při prvním spuštění (empty collection).
   */
  async function seedExampleData() {
    for (const example of EXAMPLE_DRAWINGS) {
      const newDocRef = doc(collection(db, COL))
      await setDoc(newDocRef, {
        drawingNumber: example.drawingNumber,
        photo:         null,
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
        operations:    normalizeOperations(example.operations),
      })
    }
  }

  // ─── Veřejné API (synchronní kde možné) ────────────────────────────────────

  /**
   * Vrátí všechny výkresy – již seřazené dotazem Firestore.
   */
  function getAllDrawings() {
    return drawings.value
  }

  /**
   * Najde výkres podle ID v lokálním (reaktivním) poli.
   * @param {string} id
   * @returns {Object|null}
   */
  function getDrawingById(id) {
    return drawings.value.find(d => d.id === id) ?? null
  }

  /**
   * Přidá nový výkres.
   *
   * Vrátí ID SYNCHRONNĚ (klientsky vygenerované přes doc()),
   * aby se Vue komponenta mohla okamžitě přesměrovat na detail.
   *
   * Průběh na pozadí:
   * 1. Optimistic update – přidá výkres do lokálního pole s původním base64
   * 2. Komprese fotky Canvas API (max 800px / JPEG 0.7)
   * 3. Zápis do Firestore se zkomprimovanou fotkou
   * 4. onSnapshot automaticky synchronizuje lokální pole
   *
   * @param {Object} drawingData - { drawingNumber, photo, operations }
   * @returns {string} ID nového výkresu
   */
  function addDrawing(drawingData) {
    const newDocRef = doc(collection(db, COL))
    const id = newDocRef.id
    const now = new Date().toISOString()
    const operations = normalizeOperations(drawingData.operations)

    // ── Optimistic update: okamžitě přidáme do reaktivního pole ──
    // Foto je zatím originální base64 (vysoké rozlišení) – bude nahrazeno
    // zkomprimovanou verzí po dokončení Canvas API na pozadí
    drawings.value.unshift({
      id,
      drawingNumber: drawingData.drawingNumber,
      photo:         drawingData.photo ?? null,
      createdAt:     now,
      updatedAt:     now,
      operations,
    })

    // ── Async komprese + zápis do Firestore na pozadí ──
    ;(async () => {
      try {
        const photo = await processPhoto(drawingData.photo)
        await setDoc(newDocRef, {
          drawingNumber: drawingData.drawingNumber,
          photo,
          createdAt:     serverTimestamp(),
          updatedAt:     serverTimestamp(),
          operations,
        })
        // onSnapshot automaticky aktualizuje lokální pole se zkomprimovanou fotkou
      } catch (err) {
        console.error('Soustružník DB: Chyba při ukládání výkresu:', err)
        error.value = 'Výkres se nepodařilo uložit. Zkontrolujte připojení.'
      }
    })()

    return id // ← synchronní návrat ID pro Vue komponentu
  }

  /**
   * Aktualizuje existující výkres.
   *
   * Optimistic update proběhne synchronně, komprese a Firestore zápis asynchronně.
   *
   * @param {string} id - ID výkresu
   * @param {Object} drawingData - { drawingNumber, photo, operations }
   */
  function updateDrawing(id, drawingData) {
    const operations = normalizeOperations(drawingData.operations)
    const now = new Date().toISOString()

    // ── Optimistic update ──
    const index = drawings.value.findIndex(d => d.id === id)
    if (index !== -1) {
      drawings.value[index] = {
        ...drawings.value[index],
        drawingNumber: drawingData.drawingNumber,
        photo:         drawingData.photo !== undefined
                         ? drawingData.photo
                         : drawings.value[index].photo,
        updatedAt:     now,
        operations,
      }
    }

    // ── Async komprese + zápis do Firestore na pozadí ──
    ;(async () => {
      try {
        const photo = await processPhoto(drawingData.photo)
        await updateDoc(doc(db, COL, id), {
          drawingNumber: drawingData.drawingNumber,
          photo,
          updatedAt:     serverTimestamp(),
          operations,
        })
      } catch (err) {
        console.error('Soustružník DB: Chyba při aktualizaci výkresu:', err)
        error.value = 'Výkres se nepodařilo aktualizovat. Zkontrolujte připojení.'
      }
    })()
  }

  /**
   * Smaže výkres z Firestore.
   *
   * Optimistic removal proběhne synchronně, Firestore smazání asynchronně.
   * (Fotka je uložena přímo v dokumentu – smazáním dokumentu se smaže i fotka.)
   *
   * @param {string} id - ID výkresu
   */
  function deleteDrawing(id) {
    // ── Optimistic removal ──
    const index = drawings.value.findIndex(d => d.id === id)
    if (index !== -1) {
      drawings.value.splice(index, 1)
    }

    // ── Async smazání dokumentu z Firestore ──
    ;(async () => {
      try {
        await deleteDoc(doc(db, COL, id))
      } catch (err) {
        console.error('Soustružník DB: Chyba při mazání výkresu:', err)
        error.value = 'Výkres se nepodařilo smazat. Zkontrolujte připojení.'
      }
    })()
  }

  return {
    drawings,
    loading,
    error,
    getAllDrawings,
    getDrawingById,
    addDrawing,
    updateDrawing,
    deleteDrawing,
  }
})
