import { createRouter, createWebHistory } from 'vue-router'
import DrawingList from '../views/DrawingList.vue'
import DrawingDetail from '../views/DrawingDetail.vue'
import DrawingEdit from '../views/DrawingEdit.vue'

const routes = [
  {
    // Hlavní stránka – seznam výkresů
    path: '/',
    name: 'DrawingList',
    component: DrawingList,
  },
  {
    // Nový výkres – musí být před /:id aby se "new" netraktovalo jako ID
    path: '/drawings/new',
    name: 'DrawingNew',
    component: DrawingEdit,
    props: { isNew: true },
  },
  {
    // Detail výkresu
    path: '/drawings/:id',
    name: 'DrawingDetail',
    component: DrawingDetail,
  },
  {
    // Editace výkresu
    path: '/drawings/:id/edit',
    name: 'DrawingEdit',
    component: DrawingEdit,
    props: { isNew: false },
  },
  {
    // Fallback – přesměrování na seznam
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  // Při navigaci vždy scroll na začátek stránky
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
