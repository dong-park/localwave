<template>
  <div>
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        @click="$emit('close')"
    ></div>
    <div
        v-if="isOpen"
        class="fixed top-0 left-0 right-0 rounded-b-2xl p-4 z-[100] transform transition-transform duration-300"
        :class="[
        { 'translate-y-0': isOpen, 'translate-y-full': !isOpen },
        { 'bg-gray-800': isDarkMode, 'bg-white': !isDarkMode }
      ]"
    >
      <div class="max-h-[70vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-2" :class="{ 'text-white': isDarkMode }">업종 필터</h3>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="subject in subjects"
              :key="subject.subject_id"
              @click="$emit('toggle-subject', subject.subject_id)"
              :class="[
              'flex items-center px-3 py-1 rounded-full text-sm',
              selectedSubjects.includes(subject.subject_id)
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-white font-bold border-2'
                  : 'bg-white text-gray-700 font-bold border-2'
            ]"
          >
            <span class="mr-1">{{ subject.emoji }}</span>
            {{ subject.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileBottomSheet',
  props: {
    isOpen: Boolean,
    isDarkMode: Boolean,
    subjects: Array,
    selectedSubjects: Array,
  },
  emits: ['close', 'toggle-subject'],
}
</script>
