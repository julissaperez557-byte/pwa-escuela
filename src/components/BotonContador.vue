<script setup>
     import {ref} from 'vue';
     const contador = ref(0);
</script>
<template>
     <button @click="contador ++">
      Haz dado esta cantidad de clicks {{contador}} al boton
    </button>
</template>
<style scoped></style>
