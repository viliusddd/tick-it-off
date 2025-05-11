<template>
  <Toast />
  <div class="m-2 mx-auto flex max-w-md flex-col gap-8 rounded-xl px-2 py-4 sm:px-8 sm:py-8">
    <div class="flex-1 p-3 sm:p-6 dark:bg-gray-900">
      <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        Sign up for an account
      </h2>
      <Form
        v-slot="$form"
        :resolver="zodResolver(signupSchema)"
        :initialValues="userForm"
        @submit="onSignupFormSubmit"
        :validateOnBlur="true"
        class="flex flex-col gap-4"
      >
        <div>
          <label for="email" class="mb-1 block font-medium">
            Email <span class="text-red-500">*</span>
          </label>
          <InputText name="email" type="email" autocomplete="username" fluid />
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
            autocomplete="new-password"
            class="w-full"
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
        <div>
          <label for="confirmPassword" class="mb-1 block font-medium">
            Confirm Password <span class="text-red-500">*</span>
          </label>
          <Password
            name="confirmPassword"
            type="password"
            fluid
            toggleMask
            autocomplete="new-password"
            class="w-full"
          />
          <div class="h-6">
            <Message
              v-if="$form.confirmPassword?.invalid"
              severity="error"
              size="small"
              variant="simple"
              class="text-xs"
              >{{ $form.confirmPassword.error.message }}</Message
            >
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <Button
            type="submit"
            severity="primary"
            label="Sign up"
            class="min-w-[120px] rounded-md bg-indigo-600 font-medium text-white transition hover:bg-indigo-700"
          />
        </div>
      </Form>
      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        Already have an account?
        <RouterLink
          to="/login"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Log in
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

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

const userForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: ''
})

const onSignupFormSubmit = async (event: any) => {
  try {
    await userStore.signup(userForm.value)
    // Support redirects back to the page the user was on before signing up
    const redirectTo = (router.currentRoute.value.query.redirect as string) ?? {name: 'TodoToday'}
    router.push(redirectTo)
  } catch (error: any) {
    console.error('Signup error:', error)
    toast.add({
      severity: 'error',
      summary: error?.message || 'Signup failed',
      life: 4000
    })
  }
}
</script>
