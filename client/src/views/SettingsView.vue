<template>
  <div class="card m-3 flex justify-center">
    <Toast />
    <Form v-slot="$form" :resolver :initialValues @submit="onFormSubmit" :validateOnBlur="true">
      <div class="flex flex-col gap-2">
        <div>
          <label for="firstName">First Name</label>
          <InputText name="firstName" type="text" :placeholder="initialValues?.firstName" fluid />
          <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{
            $form.firstName.error.message
          }}</Message>
        </div>
        <div>
          <label for="lastName">Last Name</label>
          <InputText name="lastName" type="text" :placeholder="initialValues?.lastName" fluid />
          <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{
            $form.lastName.error.message
          }}</Message>
        </div>
        <div>
          <label for="email">Email Address</label>
          <InputText
            name="email"
            type="email"
            :placeholder="initialValues?.email"
            fluid
            :formControl="{validateOnValueUpdate: true}"
          />
          <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
            $form.email.error.message
          }}</Message>
        </div>
        <div>
          <label for="passowrd">Password</label>
          <InputText
            name="oldPassword"
            type="password"
            placeholder="Old password"
            fluid
            toggleMask
          />
          <InputText
            class="my-1"
            name="newPassword"
            type="password"
            placeholder="New password"
            fluid
            toggleMask
          />
          <InputText
            name="newPasswordConfirm"
            type="password"
            placeholder="Repeat new password"
            fluid
            toggleMask
          />
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
import {ref, onBeforeMount} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {InputText, Button, useToast, Toast, Message} from 'primevue'
import {Form} from '@primevue/forms'
import type {User} from '@server/shared/types'

const userStore = useUserStore()
const initialValues = ref()
const toast = useToast()

onBeforeMount(async () => (initialValues.value = await userStore.currentUser))

type Errors = {
  firstName: [{message: string}]
  lastName: [{message: string}]
  email: [{message: string}]
}

const resolver = ({values}: {values: User}) => {
  const errors: Errors = {
    firstName: [{message: ''}],
    lastName: [{message: ''}],
    email: [{message: ''}]
  }

  if (!values.firstName) {
    errors.firstName = [{message: 'First Name is required.'}]
  }

  if (!values.lastName) {
    errors.lastName = [{message: 'Last Name is required.'}]
  }

  if (!values.email) {
    errors.email = [{message: 'Email required.'}]
  }

  return {errors}
}

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
