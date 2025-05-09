<template>
  <Toast />
  <div class="m-2 flex flex-col gap-8 rounded-xl px-2 py-4 sm:px-8 sm:py-8">
    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- Profile Information -->
      <div class="flex-1 rounded-lg p-3 sm:p-6">
        <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Profile Information
        </h2>
        <Form
          v-if="userValuesLoaded"
          :key="profileFormKey"
          v-slot="$form"
          :resolver
          :initialValues="userValues"
          @submit="onFormSubmit"
          :validateOnBlur="true"
          class="flex flex-col gap-4"
        >
          <div>
            <label for="firstName" class="mb-1 block font-medium">
              First Name <span class="text-red-500">*</span>
            </label>
            <InputText
              name="firstName"
              type="text"
              :placeholder="userValues?.firstName"
              fluid
              class="w-full rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <div class="h-6">
              <Message
                v-if="$form.firstName?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="text-xs"
                >{{ $form.firstName.error.message }}
              </Message>
            </div>
          </div>
          <div>
            <label for="lastName" class="mb-1 block font-medium">
              Last Name <span class="text-red-500">*</span>
            </label>
            <InputText
              name="lastName"
              type="text"
              :placeholder="userValues?.lastName"
              fluid
              class="w-full rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <div class="h-6">
              <Message
                v-if="$form.lastName?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="text-xs"
                >{{ $form.lastName.error.message }}
              </Message>
            </div>
          </div>
          <div>
            <label for="email" class="mb-1 block font-medium">
              Email Address <span class="text-red-500">*</span>
            </label>
            <InputText
              name="email"
              type="email"
              :placeholder="userValues?.email"
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
                >{{ $form.email.error.message }}
              </Message>
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              severity="secondary"
              outlined
              @click="onProfileReset"
              class="flex min-w-[40px] items-center justify-center rounded-md font-medium transition sm:min-w-[120px]"
            >
              <i class="pi pi-refresh xxs:inline text-base"></i>
              <span class="xxs:hidden">Reset</span>
            </Button>
            <Button
              type="submit"
              severity="primary"
              label="Update Details"
              class="min-w-[120px] rounded-md bg-indigo-600 font-medium text-white transition hover:bg-indigo-700"
            />
          </div>
        </Form>
      </div>
      <!-- Divider for large screens -->
      <div class="mx-2 hidden w-px bg-gray-200 lg:block dark:bg-gray-700"></div>
      <!-- Change Password -->
      <div class="flex-1 rounded-lg p-3 sm:p-6">
        <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Change Password</h2>
        <Form
          :key="passwordFormKey"
          v-slot="$form"
          :resolver
          :initialValues="passwordValues"
          @submit="onFormSubmit"
          :validateOnBlur="true"
          class="flex flex-col gap-4"
        >
          <div>
            <label for="originalPassword" class="mb-1 block font-medium">
              Old Password <span class="text-red-500">*</span>
            </label>
            <Password
              name="originalPassword"
              type="password"
              :feedback="false"
              fluid
              toggleMask
              class="w-full"
              :inputClass="'rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'"
            />
            <div class="h-6">
              <Message
                v-if="$form.originalPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="text-xs"
                >{{ $form.originalPassword.error.message }}</Message
              >
            </div>
          </div>
          <div>
            <label for="changePassword" class="mb-1 block font-medium">
              New Password <span class="text-red-500">*</span>
            </label>
            <Password
              class="w-full"
              name="changePassword"
              type="password"
              fluid
              toggleMask
              :inputClass="'rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'"
            />
            <div class="h-6">
              <Message
                v-if="$form.changePassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="text-xs"
                >{{ $form.changePassword.error.message }}</Message
              >
            </div>
          </div>
          <div>
            <label for="repeatPassword" class="mb-1 block font-medium">
              Repeat New Password <span class="text-red-500">*</span>
            </label>
            <Password
              name="repeatPassword"
              type="password"
              fluid
              toggleMask
              class="w-full"
              :inputClass="'rounded-md border border-gray-300 bg-gray-50 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'"
            />
            <div class="h-6">
              <Message
                v-if="$form.repeatPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                class="text-xs"
                >{{ $form.repeatPassword.error.message }}</Message
              >
            </div>
          </div>
          <Message
            v-if="
              $form.repeatPassword?.value &&
              $form.repeatPassword?.value.length > 0 &&
              $form.changePassword?.value !== $form.repeatPassword?.value
            "
            severity="error"
            size="small"
            variant="simple"
            class="text-xs"
            >Passwords don't match.</Message
          >
          <div class="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              severity="secondary"
              outlined
              @click="onPasswordReset"
              class="flex min-w-[40px] items-center justify-center rounded-md font-medium transition sm:min-w-[120px]"
            >
              <i class="pi pi-refresh xxs:inline text-base"></i>
              <span class="xxs:hidden">Reset</span>
            </Button>
            <Button
              type="submit"
              severity="danger"
              label="Change Password"
              class="min-w-[120px] rounded-md bg-red-600 font-medium text-white transition hover:bg-red-700"
            />
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onBeforeMount, reactive} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {InputText, Button, useToast, Toast, Message, Password} from 'primevue'
import {Form} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {z} from 'zod'

const toast = useToast()
const userStore = useUserStore()
const userValues = ref({firstName: '', lastName: '', email: ''})
const userValuesLoaded = ref(false)
const profileFormKey = ref(0)
const passwordFormKey = ref(0)

const passwordValues = reactive({
  originalPassword: '',
  changePassword: '',
  repeatPassword: ''
})

onBeforeMount(async () => {
  const user = await userStore.currentUser
  userValues.value = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? ''
  }
  userValuesLoaded.value = true
})

const nameSchema = z
  .string()
  .min(2, {message: 'Minimum 2 characters.'})
  .max(33, {message: 'Maximum 33 characters.'})

const passwordSchema = z
  .string()
  .min(8, {message: 'Minimum 8 characters.'})
  .max(33, {message: 'Maximum 33 characters.'})
  .refine(value => /[a-z]/.test(value), {
    message: 'Must have a lowercase letter.'
  })
  .refine(value => /[A-Z]/.test(value), {
    message: 'Must have an uppercase letter.'
  })
  .refine(value => /[1-9]/.test(value), {
    message: 'Must have a number.'
  })

const resolver = ref(
  zodResolver(
    z.object({
      firstName: nameSchema,
      lastName: nameSchema,
      originalPassword: z.string(),
      changePassword: passwordSchema,
      repeatPassword: passwordSchema,
      email: z.string().email()
    })
  )
)

const onFormSubmit = ({valid}: {valid: boolean}) => {
  if (valid) {
    toast.add({
      severity: 'success',
      summary: 'Details changed.',
      life: 3000
    })
  }
}

function onProfileReset() {
  profileFormKey.value++
}

function onPasswordReset() {
  passwordFormKey.value++
}
</script>

<style>
@media (max-width: 309px) {
  .xxs\:hidden {
    display: none !important;
  }
  .xxs\:inline {
    display: inline !important;
  }
}
@media (min-width: 310px) {
  .xxs\:hidden {
    display: inline !important;
  }
  .xxs\:inline {
    display: none !important;
  }
}
</style>
