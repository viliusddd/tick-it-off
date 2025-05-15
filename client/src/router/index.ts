import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import TodoView from '@/views/TodoView.vue'
import MainLayout from '@/components/MainLayout.vue'
import {authenticate} from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    beforeEnter: [authenticate],
    children: [
      {
        path: '',
        redirect: '/todo'
      },
      {
        path: '/todo',
        name: 'TodoToday',
        component: TodoView,
        props: () => ({currentDate: new Date()})
      },
      {
        path: '/today',
        name: 'TodayAlias',
        component: TodoView,
        props: () => ({currentDate: new Date()})
      },
      {
        path: '/:date(\\d{4}-\\d{2}-\\d{2})',
        name: 'SpecificDate',
        component: TodoView,
        props: route => ({currentDate: new Date(route.params.date as string)})
      },
      {
        path: '/statistics',
        name: 'Statistics',
        component: () => import('@/views/StatisticsView.vue')
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/UsersView.vue')
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/Auth/SignupView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (to.name === 'Today' || to.name === 'TodayAlias') {
    const todayString = today.toLocaleDateString('lt')
    next({name: 'SpecificDate', params: {date: todayString}, replace: true})
  } else if (to.name === 'SpecificDate') {
    const routeDate = new Date(to.params.date as string)
    routeDate.setHours(0, 0, 0, 0)

    if (routeDate > today) {
      next({
        name: 'SpecificDate',
        params: {date: today.toLocaleDateString('lt')},
        replace: true
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
