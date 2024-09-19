<template>
  <div>
    <SeoulMap @stores-updated="updateStoreList" />
  </div>
</template>

<script>
import { ref } from 'vue';
import SeoulMap from "@/SeoulMap.vue";

export default {
  components: {
    SeoulMap,
  },
  setup() {
    const visibleStores = ref([]);

    const updateStoreList = (stores) => {
      visibleStores.value = stores;
    };

    return {
      visibleStores,
      updateStoreList
    };
  }
}
</script>
