<template>
  <Form>
    <div class="mb-2 flex flex-col gap-2">
      <label for="firstName">First Name</label>
      <InputText name="firstName" type="text" :placeholder="currentUser?.firstName" fluid />
      <label for="lastName">Last Name</label>
      <InputText name="lastName" type="text" :placeholder="currentUser?.lastName" fluid />
      <label for="passowrd">Password</label>
      <InputText
        name="oldPassword"
        type="password"
        placeholder="original password"
        fluid
        toggleMask
      />
      <InputText name="newPassword" type="password" placeholder="new password" fluid toggleMask />
      <InputText
        name="newPasswordConfirm"
        type="password"
        placeholder="repeat new password"
        fluid
        toggleMask
      />
      <!-- <Message>foo</Message> -->
    </div>
    <div class="flex justify-end gap-2">
      <Button type="reset" severity="secondary" label="Reset" />
      <Button type="submit" severity="danger" label="Submit" />
    </div>
  </Form>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {InputText, Message, Button, useToast} from 'primevue'
import {Form} from '@primevue/forms'
import {useUserStore} from '@/stores/userStore'

const userStore = useUserStore()

const toast = useToast()

const currentUser = ref()

onMounted(async () => (currentUser.value = await userStore.currentUser))
</script>
