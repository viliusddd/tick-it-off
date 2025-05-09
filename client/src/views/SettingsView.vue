<template>
  <Toast />
  <div class="card m-1 flex flex-col gap-5 sm:m-3">
    <div class="flex flex-row flex-wrap">
      <Form
        v-slot="$form"
        :resolver
        :initialValues="userValues"
        @submit="onFormSubmit"
        :validateOnBlur="true"
        class="basis-sm flex w-1/2 min-w-52 flex-grow flex-col gap-2 p-1 lg:p-2"
      >
        <div class="mt-5">
          <label for="firstName">First Name</label>
          <InputText name="firstName" type="text" :placeholder="userValues?.firstName" fluid />
          <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple"
            >{{ $form.firstName.error.message }}
          </Message>
        </div>
        <div>
          <label for="lastName">Last Name</label>
          <InputText name="lastName" type="text" :placeholder="userValues?.lastName" fluid />
          <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple"
            >{{ $form.lastName.error.message }}
          </Message>
        </div>
        <div>
          <label for="email">Email Address</label>
          <InputText name="email" type="email" :placeholder="userValues?.email" fluid />
          <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple"
            >{{ $form.email.error.message }}
          </Message>
        </div>
      </Form>

      <Form
        v-slot="$form"
        :resolver
        :initialValues="passwordValues"
        @submit="onFormSubmit"
        :validateOnBlur="true"
        class="basis-sm flex w-1/2 min-w-52 flex-grow flex-col gap-2 p-1 lg:p-2"
      >
        <div>
          <div class="mt-5">
            <label for="originalPassword">
              Old Password
              <span class="text-red-500"> *</span>
            </label>
            <Password name="originalPassword" type="password" :feedback="false" fluid toggleMask />
            <Message
              v-if="$form.originalPassword?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $form.originalPassword.error.message }}</Message
            >
          </div>
          <div>
            <div>
              <label for="changePassword">Change Password</label>
              <Password class="my-1" name="changePassword" type="password" fluid toggleMask />
              <Message
                v-if="$form.changePassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.changePassword.error.message }}</Message
              >
            </div>
            <div>
              <label for="repeatPassword">Repeat Password</label>
              <Password name="repeatPassword" type="password" fluid toggleMask />
              <Message
                v-if="$form.repeatPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.repeatPassword.error.message }}</Message
              >
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
          </div>
        </div>
      </Form>
    </div>

    <div class="flex justify-between p-1 lg:p-2">
      <Button type="reset" severity="secondary" label="Cancel" />
      <Button type="submit" severity="danger" label="Submit" />
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
const userValues = ref()

const passwordValues = reactive({
  originalPassword: '',
  changePassword: '',
  repeatPassword: ''
})

onBeforeMount(async () => (userValues.value = await userStore.currentUser))

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
</script>

<style scoped>
.card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}
</style>
