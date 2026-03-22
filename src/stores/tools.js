/**
 * tools.js – Pinia store pro správu nástrojů T1–T30
 * Stejná architektura jako drawings.js (Firestore + optimistic updates)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const COL = 'tools'

function emptyTool(pos) {
  return {
    id: pos,
    position: pos,
    manufacturerCode: '',
    name: '',
    photos: [],
    description: '',
    rpmMin: '',
    rpmMax: '',
    material: '',
    note: '',
  }
}

function compressImage(dataUrl, maxSize = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
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
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function nNumber(id) {
  return parseInt(id.slice(1)) || 0
}

export const useToolsStore = defineStore('tools', () => {
  const tools = ref([])
  const loading = ref(true)
  const error = ref(null)
  let seeded = false

  onSnapshot(
    collection(db, COL),
    async (snapshot) => {
      // První spuštění s prázdnou kolekcí → vytvoříme 5 výchozích nástrojů
      if (snapshot.empty && !seeded) {
        seeded = true
        for (let i = 1; i <= 5; i++) {
          const pos = `N${i}`
          await setDoc(doc(db, COL, pos), { ...emptyTool(pos) })
        }
        return // onSnapshot se znovu spustí s daty
      }

      const list = []
      snapshot.docs.forEach(d => {
        const data = d.data()
        const photos = Array.isArray(data.photos)
          ? data.photos
          : (data.photo ? [data.photo] : [])
        list.push({ id: d.id, ...data, photos })
      })
      // Seřadit podle čísla N
      tools.value = list.sort((a, b) => nNumber(a.id) - nNumber(b.id))
      loading.value = false
    },
    (err) => {
      console.error('Tools onSnapshot error:', err)
      error.value = err.message
      loading.value = false
    }
  )

  function getToolByPosition(pos) {
    return tools.value.find(t => t.id === pos) ?? emptyTool(pos)
  }

  function addTool() {
    const maxN = tools.value.reduce((m, t) => Math.max(m, nNumber(t.id)), 0)
    const pos = `N${maxN + 1}`
    // Optimistic update
    tools.value.push(emptyTool(pos))
    // Firestore zápis
    setDoc(doc(db, COL, pos), { ...emptyTool(pos) }).catch(err => {
      console.error('Tools addTool error:', err)
      error.value = 'Nepodařilo se přidat nástroj.'
    })
    return pos
  }

  function saveTool(pos, data) {
    // Optimistic update
    const idx = tools.value.findIndex(t => t.id === pos)
    if (idx !== -1) {
      tools.value[idx] = { ...tools.value[idx], ...data, id: pos }
    }

    // Async komprese + Firestore zápis
    ;(async () => {
      try {
        const photos = await Promise.all((data.photos || []).map(p => compressImage(p)))

        await setDoc(doc(db, COL, pos), {
          position:         pos,
          manufacturerCode: data.manufacturerCode ?? '',
          name:             data.name             ?? '',
          photos,
          description:      data.description      ?? '',
          rpmMin:           data.rpmMin            ?? '',
          rpmMax:           data.rpmMax            ?? '',
          material:         data.material          ?? '',
          note:             data.note              ?? '',
        })
      } catch (err) {
        console.error('Tools save error:', err)
        error.value = 'Nástroj se nepodařilo uložit.'
      }
    })()
  }

  function deleteTool(pos) {
    // Optimistic removal
    tools.value = tools.value.filter(t => t.id !== pos)
    // Firestore smazání
    deleteDoc(doc(db, COL, pos)).catch(err => {
      console.error('Tools deleteTool error:', err)
      error.value = 'Nepodařilo se smazat nástroj.'
    })
  }

  return { tools, loading, error, getToolByPosition, addTool, saveTool, deleteTool }
})
