<template>
  <div class="card m-3 flex justify-center">
    <Toast />
    <Form
      v-slot="$form"
      :resolver
      :initialValues="userValues"
      @submit="onFormSubmit"
      :validateOnBlur="true"
    >
      <div class="flex flex-col gap-2">
        <div>
          <label for="firstName">First Name</label>
          <InputText name="firstName" type="text" :placeholder="userValues?.firstName" fluid />
          <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{
            $form.firstName.error.message
          }}</Message>
        </div>
        <div>
          <label for="lastName">Last Name</label>
          <InputText name="lastName" type="text" :placeholder="userValues?.lastName" fluid />
          <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{
            $form.lastName.error.message
          }}</Message>
        </div>
        <div>
          <label for="email">Email Address</label>
          <InputText name="email" type="email" :placeholder="userValues?.email" fluid />
          <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
            $form.email.error.message
          }}</Message>
        </div>
      </div>
    </Form>
    <Form
      v-slot="$form"
      :resolver
      :initialValues="passwordValues"
      @submit="onFormSubmit"
      :validateOnBlur="true"
    >
      <div class="flex flex-col gap-2">
        <div>
          <div>
            <label for="oldPassowrd">Password</label>
            <Password
              name="oldPassword"
              type="password"
              placeholder="Old password"
              :feedback="false"
              fluid
              toggleMask
            />
            <Message
              v-if="$form.oldPassword?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $form.oldPassword.error.message }}</Message
            >
          </div>
          <div>
            <div>
              <Password
                class="my-1"
                name="newPassword"
                type="password"
                placeholder="New password"
                fluid
                toggleMask
              />
              <Message
                v-if="$form.newPassword?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.newPassword.error.message }}</Message
              >
            </div>
            <div>
              <Password
                name="newPasswordConfirm"
                type="password"
                placeholder="Repeat new password"
                fluid
                toggleMask
              />
              <Message
                v-if="$form.newPasswordConfirm?.invalid"
                severity="error"
                size="small"
                variant="simple"
                >{{ $form.newPasswordConfirm.error.message }}</Message
              >
            </div>
            <Message
              v-if="
                $form.newPasswordConfirm?.value &&
                $form.newPasswordConfirm?.value.length > 0 &&
                $form.newPassword?.value !== $form.newPasswordConfirm?.value
              "
              severity="error"
              size="small"
              variant="simple"
              >Passwords don't match.</Message
            >
          </div>
        </div>
      </div>
      <div class="my-3 flex justify-end gap-2">
        <Button type="reset" severity="secondary" label="Cancel" />
        <Button type="submit" severity="danger" label="Submit" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {ref, onBeforeMount, reactive} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {InputText, Button, useToast, Toast, Message, Password} from 'primevue'
import {Form} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {type UserPublic} from '@server/shared/types'
import {z} from 'zod'

const toast = useToast()
const userStore = useUserStore()
const userValues = ref<UserPublic | null>(null)

const passwordValues = reactive({
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: ''
})

onBeforeMount(async () => (userValues.value = await userStore.currentUser))

const nameSchema = z
  .string()
  .min(2, {message: 'Minimum 2 characters.'})
  .max(33, {message: 'Maximum 33 characters.'})

const passwordSchema = z
  .string()
  .min(8, {message: 'Minimum 8 characters.'})
  .max(22, {message: 'Maximum 22 characters.'})
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
      oldPassword: z.string(),
      newPassword: passwordSchema,
      newPasswordConfirm: passwordSchema,
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
