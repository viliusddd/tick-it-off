import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import TodoView from '@/views/TodoView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: MainLayout,
    beforeEnter: [authenticate],
    children: [
      {
        path: 'write-article',
        name: 'WriteArticle',
        component: () => import('@/views/WriteArticle.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/SignupView.vue'),
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'article/:id',
        name: 'Article',
        component: () => import('@/views/ArticleView.vue'),
      },
      {
        path: '',
        name: 'Home',
        component: TodoView,
      },
    ],
  },
  {
    path: '/',
    name: 'Today',
    component: TodoView,
    props: () => ({ currentDate: new Date() }),
  },
  {
    path: '/today',
    name: 'TodayAlias',
    component: TodoView,
    props: () => ({ currentDate: new Date() }),
  },
  {
    path: '/:date(\\d{4}-\\d{2}-\\d{2})',
    name: 'SpecificDate',
    component: TodoView,
    props: (route) => ({ currentDate: new Date(route.params.date as string) }),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (to.name === 'Today' || to.name === 'TodayAlias') {
    const todayString = today.toLocaleDateString('lt')
    next({ name: 'SpecificDate', params: { date: todayString }, replace: true })
  } else if (to.name === 'SpecificDate') {
    const routeDate = new Date(to.params.date as string)
    routeDate.setHours(0, 0, 0, 0)

    if (routeDate > today) {
      next({
        name: 'SpecificDate',
        params: { date: today.toLocaleDateString('lt') },
        replace: true,
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
