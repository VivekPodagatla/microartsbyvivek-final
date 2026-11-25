// ================= ORIGINAL PHOTOS (IndexedDB) =================
// The customer's original photo files, kept in the browser until
// the request is sent, so a refresh or a slow server wake-up never
// loses them. localStorage is far too small for photos.
// Every call fails quietly: without IndexedDB the photos simply
// live in memory for this visit only.

const DB_NAME = "microarts-designer"
const STORE = "photos"

let opening = null

function openDb() {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return opening
}

async function run(mode, action) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = action(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(request?.result)
    tx.onerror = () => reject(tx.error)
  })
}

export const savePhoto = (id, file) =>
  run("readwrite", (store) => store.put(file, id)).catch(() => {})

export const loadPhoto = (id) =>
  run("readonly", (store) => store.get(id)).catch(() => undefined)

export const deletePhoto = (id) =>
  run("readwrite", (store) => store.delete(id)).catch(() => {})

export const clearPhotos = () =>
  run("readwrite", (store) => store.clear()).catch(() => {})
