<template>
  <div class="card flex justify-center">
    <Toast />
    <Form v-slot="$form" :initialValues @submit="onFormSubmit">
      <div class="mb-2 flex flex-col gap-2">
        <label for="firstName">First Name</label>
        <InputText name="firstName" type="text" :placeholder="initialValues?.firstName" fluid />

        <label for="lastName">Last Name</label>
        <InputText name="lastName" type="text" :placeholder="initialValues?.lastName" fluid />

        <label for="passowrd">Password</label>
        <InputText name="oldPassword" type="password" placeholder="Old password" fluid toggleMask />
        <InputText name="newPassword" type="password" placeholder="New password" fluid toggleMask />
        <InputText
          name="newPasswordConfirm"
          type="password"
          placeholder="Repeat new password"
          fluid
          toggleMask
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="reset" severity="secondary" label="Cancel" />
        <Button type="submit" severity="danger" label="Submit" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {ref, onBeforeMount} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {InputText, Button, useToast, Toast} from 'primevue'
import {Form} from '@primevue/forms'

const userStore = useUserStore()
const initialValues = ref()
const toast = useToast()

onBeforeMount(async () => (initialValues.value = await userStore.currentUser))

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
