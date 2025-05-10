<template>
  <Toast />
  <div class="m-2 mx-auto flex max-w-md flex-col gap-8 rounded-xl px-2 py-4 sm:px-8 sm:py-8">
    <div class="flex-1 rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-900">
      <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        Log in to your account
      </h2>
      <Form
        v-slot="$form"
        :resolver="zodResolver(loginSchema)"
        :initialValues="userForm"
        @submit="onLoginFormSubmit"
        :validateOnBlur="true"
        class="flex flex-col gap-4"
      >
        <div>
          <label for="email" class="mb-1 block font-medium">
            Email <span class="text-red-500">*</span>
          </label>
          <InputText
            name="email"
            type="email"
            autocomplete="username"
            fluid
            class="w-full rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <div class="h-6">
            <Message
              v-if="$form.email?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="text-xs"
              >{{ $form.email.error.message }}</Message
            >
          </div>
        </div>
        <div>
          <label for="password" class="mb-1 block font-medium">
            Password <span class="text-red-500">*</span>
          </label>
          <Password
            name="password"
            type="password"
            fluid
            toggleMask
            autocomplete="current-password"
            class="w-full"
            :inputClass="'rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'"
          />
          <div class="h-6">
            <Message
              v-if="$form.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="text-xs"
              >{{ $form.password.error.message }}</Message
            >
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <Button
            type="submit"
            severity="primary"
            label="Log in"
            class="min-w-[120px] rounded-md bg-indigo-600 font-medium text-white transition hover:bg-indigo-700"
          />
        </div>
      </Form>
      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        Not a member?
        <RouterLink
          to="/signup"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </RouterLink>
        <br />
        or go
        <RouterLink to="/" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          back home
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {useRouter} from 'vue-router'
import {InputText, Button, useToast, Toast, Message, Password} from 'primevue'
import {Form} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {z} from 'zod'
import {userSchema} from '@entities/user'

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const loginSchema = userSchema.pick({email: true, password: true})

const userForm = ref({
  email: '',
  password: ''
})

const onLoginFormSubmit = async (event: any) => {
  const {states, valid} = event
  if (!valid) return
  try {
    await userStore.login({
      email: states.email.value,
      password: states.password.value
    })
    // Support redirects back to the page the user was on before logging in
    const redirectTo = (router.currentRoute.value.query.redirect as string) ?? {name: 'TodoToday'}
    router.push(redirectTo)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: error?.message || 'Login failed',
      life: 4000
    })
  }
}
</script>
