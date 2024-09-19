<template>
  <div class="absolute bottom-4 left-4 z-[100]">
    <div class="flex space-x-2">
      <button
          @click="$emit('open-seoul-pay')"
          class="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-110"
          :class="{ 'bg-gray-800': isDarkMode, 'bg-white': !isDarkMode }"
      >
        <img
            src="/map-app-icon.svg"
            alt="SeoulPay"
            class="w-12 h-12"
        />
      </button>

      <button
          @click="$emit('toggle-dark-mode')"
          class="rounded-full shadow z-50 transition-transform duration-300 ease-in-out transform hover:scale-110 w-8 h-8 md:w-12 md:h-12"
          :class="{ 'bg-gray-800 text-white hover:bg-gray-900': isDarkMode, 'bg-white text-gray-800 hover:bg-gray-100': !isDarkMode }"
      >
        {{ isDarkMode ? '🌙' : '☀️' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatingButtons',
  props: {
    isDarkMode: {
      type: Boolean,
      required: true
    }
  },
  emits: ['open-seoul-pay', 'toggle-dark-mode']
}
</script>
