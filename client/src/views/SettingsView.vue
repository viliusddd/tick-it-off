<template>
  <Toast />
  <div class="m-2 flex flex-col gap-8 rounded-xl px-2 py-4 sm:px-8 sm:py-8">
    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- Profile Information -->
      <div class="flex-1 rounded-lg p-3 sm:p-6">
        <h2 class="mb-4 text-xl font-semibold">Profile Information</h2>
        <Form
          v-if="userValuesLoaded"
          :key="profileFormKey"
          v-slot="$form"
          :resolver="zodResolver(userSchema.omit({password: true}))"
          :initialValues="userValues"
          @submit="onDetailsFormSubmit"
          :validateOnBlur="true"
          class="flex flex-col gap-4"
        >
          <div>
            <label for="firstName" class="mb-1 block font-medium">
              First Name <RequiredStar />
            </label>
            <InputText
              name="firstName"
              type="text"
              :placeholder="userValues?.firstName"
              autocomplete="given-name"
              fluid
              class="w-full rounded-md border"
            />
            <div class="h-6">
              <Message
                v-if="$form.firstName?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.firstName.error.message }}
              </Message>
            </div>
          </div>
          <div>
            <label for="lastName" class="mb-1 block font-medium">
              Last Name <RequiredStar />
            </label>
            <InputText
              name="lastName"
              type="text"
              :placeholder="userValues?.lastName"
              autocomplete="family-name"
              fluid
              class="w-full rounded-md border"
            />
            <div class="h-6">
              <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple"
                >{{ $form.lastName.error.message }}
              </Message>
            </div>
          </div>
          <div>
            <label for="email" class="mb-1 block font-medium">
              Email Address <RequiredStar />
            </label>
            <InputText
              name="email"
              type="text"
              :placeholder="userValues?.email"
              autocomplete="email"
              fluid
            />
            <div class="h-6">
              <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple"
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
              class="min-w-[40px] sm:min-w-[120px]"
            >
              <i class="pi pi-refresh xxs:inline text-base"></i>
              <span class="xxs:hidden">Reset</span>
            </Button>
            <Button type="submit" severity="primary" label="Update Details" />
          </div>
        </Form>
      </div>
      <!-- Divider for large screens -->
      <div class="mx-2 hidden w-px lg:block"></div>
      <!-- Change Password -->
      <div class="flex-1 rounded-lg p-3 sm:p-6">
        <h2 class="mb-4 text-xl font-semibold">Change Password</h2>
        <Form
          :key="passwordFormKey"
          v-slot="$form"
          :resolver="zodResolver(userPasswordChangeSchema)"
          :initialValues="passwordValues"
          @submit="onPasswordFormSubmit"
          :validateOnBlur="true"
          class="flex flex-col gap-4"
        >
          <div>
            <label for="originalPassword" class="mb-1 block font-medium">
              Current Password <RequiredStar />
            </label>
            <Password
              name="originalPassword"
              type="password"
              :feedback="false"
              fluid
              toggleMask
              autocomplete="current-password"
              class="w-full"
            />
            <div class="h-6">
              <Message
                v-if="$form.originalPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.originalPassword.error.message }}</Message
              >
            </div>
          </div>
          <div>
            <label for="changePassword" class="mb-1 block font-medium">
              New Password <RequiredStar />
            </label>
            <Password
              class="w-full"
              name="changePassword"
              type="password"
              fluid
              toggleMask
              autocomplete="new-password"
            />
            <div class="h-6">
              <Message
                v-if="$form.changePassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.changePassword.error.message }}</Message
              >
            </div>
          </div>
          <div>
            <label for="repeatPassword" class="mb-1 block font-medium">
              Repeat New Password <RequiredStar />
            </label>
            <Password
              name="repeatPassword"
              type="password"
              fluid
              toggleMask
              autocomplete="new-password"
              class="w-full"
            />
            <div class="h-6">
              <Message
                v-if="$form.repeatPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
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
            >Passwords don't match.</Message
          >
          <div class="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              severity="secondary"
              outlined
              @click="onPasswordReset"
              class="flex min-w-[40px] sm:min-w-[120px]"
            >
              <i class="pi pi-refresh xxs:inline text-base"></i>
              <span class="xxs:hidden">Reset</span>
            </Button>
            <Button type="submit" severity="danger" label="Change Password" />
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
import {userSchema, userPasswordChangeSchema} from '@entities/user'
import RequiredStar from '@/components/UI/RequiredStar.vue'

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

async function loadUserValues() {
  const user = await userStore.currentUser
  userValues.value = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? ''
  }
  userValuesLoaded.value = true
}

onBeforeMount(() => {
  loadUserValues()
})

const showToast = (
  severity: 'error' | 'success' | 'info' | 'warn' | 'secondary' | 'contrast',
  summary: string,
  life = 3000
) => {
  toast.add({severity, summary, life})
}

const onDetailsFormSubmit = async (event: any) => {
  const {states, valid} = event
  const firstName = states.firstName?.value
  const lastName = states.lastName?.value
  const email = states.email?.value

  if (!valid) return

  // Compare with original values
  if (
    userValues.value &&
    firstName === userValues.value.firstName &&
    lastName === userValues.value.lastName &&
    email === userValues.value.email
  ) {
    showToast('info', 'No changes detected.')
    return
  }

  const id = userStore.authUserId
  if (!id) {
    showToast('error', 'User not authenticated.')
    return
  }

  try {
    await userStore.updateDetails({id, firstName, lastName, email})
    showToast('success', 'Details changed.')
  } catch (error: any) {
    showToast('error', error?.message || 'Failed to update details.')
  }
}

const onPasswordFormSubmit = async (event: any) => {
  const {states, valid} = event
  const originalPassword = states.originalPassword?.value
  const changePassword = states.changePassword?.value
  const repeatPassword = states.repeatPassword?.value

  if (!valid) {
    showToast('error', 'Please fill in all password fields correctly.')
    return
  }

  if (changePassword !== repeatPassword) {
    showToast('error', "Passwords don't match.")
    return
  }

  try {
    await userStore.updatePassword(originalPassword, changePassword)
    showToast('success', 'Password changed successfully.')
    onPasswordReset()
  } catch (error: any) {
    showToast('error', error?.message || 'Failed to change password.')
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
