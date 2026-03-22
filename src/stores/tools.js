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
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const COL = 'tools'
const ALL_POSITIONS = Array.from({ length: 30 }, (_, i) => `N${i + 1}`)

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

export const useToolsStore = defineStore('tools', () => {
  const tools = ref(ALL_POSITIONS.map(emptyTool))
  const loading = ref(true)
  const error = ref(null)

  onSnapshot(
    collection(db, COL),
    (snapshot) => {
      const fromFirestore = {}
      snapshot.docs.forEach(d => {
        const data = d.data()
        // Backward compat: staré dokumenty mají photo (string), nové photos (array)
        let photos
        if (Array.isArray(data.photos)) {
          photos = data.photos
        } else if (data.photo) {
          photos = [data.photo]
        } else {
          photos = []
        }
        fromFirestore[d.id] = { id: d.id, ...data, photos }
      })
      tools.value = ALL_POSITIONS.map(pos => fromFirestore[pos] ?? emptyTool(pos))
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

  return { tools, loading, error, getToolByPosition, saveTool }
})
