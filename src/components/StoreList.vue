<template>
  <div class="flex flex-col h-full">
    <!-- 고정된 검색창 -->
    <div class="p-2 md:p-4 shadow-md" :class="{ 'bg-gray-800': isDarkMode }">
      <div class="relative">
        <input
            v-model="localSearchQuery"
            @keyup.enter="debouncedSearch"
            placeholder="제목 또는 주소 검색"
            class="p-2 border rounded w-full"
            :class="{ 'bg-gray-700 text-white': isDarkMode }"
        >
        <button @click="search" class="absolute right-3 top-1 hover:bg-gray-300 p-1 rounded">🔍</button>
      </div>
    </div>

    <!-- 스크롤 가능한 스토어 목록 -->
    <div class="flex-1 overflow-y-auto" ref="scrollContainer" @scroll="handleScroll">
      <div class="p-4">
        <div v-if="stores.length > 0">
          <h3 class="text-base md:text-lg font-bold mb-2 md:mb-4" :class="{ 'text-white': isDarkMode }">
            검색 결과 ({{ totalCount }}개)
          </h3>
          <ul class="list-none pl-0 space-y-4">
            <li v-for="store in stores" :key="store.id"
                class="p-2 md:p-4 border rounded cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                :class="{ 'hover:bg-gray-700': isDarkMode }"
                @click="$emit('select-store', store)">
              <div class="flex items-start">
                <span class="text-sm md:text-2xl mr-3">{{ getSubjectEmoji(store.subject_id) }}</span>
                <div>
                  <strong class="text-base md:text-lg" :class="{ 'text-white': isDarkMode }">{{ store.title }}</strong>
                  <p class="text-xs md:text-sm" :class="{ 'text-gray-400': isDarkMode }">{{ store.address }}</p>
                  <p class="text-xs md:text-sm text-gray-500">{{ getSubjectName(store.subject_id) }}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="loading" class="mt-4 text-center" :class="{ 'text-white': isDarkMode }">
          데이터를 불러오는 중...
        </div>

        <div v-if="error" class="mt-4 text-center text-red-500">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 스크립트 부분은 변경 없음
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useSubjects } from '@/composables/useSubjects';
import debounce from 'lodash/debounce';

export default {
  name: 'StoreList',
  props: {
    stores: {
      type: Array,
      required: true
    },
    totalCount: {
      type: Number,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    error: {
      type: String,
      default: null
    },
    hasMore: {
      type: Boolean,
      required: true
    },
    isDarkMode: {
      type: Boolean,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['search', 'load-more', 'select-store'],
  setup(props, {emit}) {
    const {getSubjectName, getSubjectEmoji, loadSubjects} = useSubjects();
    const localSearchQuery = ref(props.searchQuery);
    const scrollContainer = ref(null);
    loadSubjects();

    const debouncedSearch = debounce(() => {
      emit('search', localSearchQuery.value);
    }, 300);

    const search = () => {
      emit('search', localSearchQuery.value);
    };

    const handleScroll = debounce(() => {
      if (!scrollContainer.value) return;

      const {scrollTop, scrollHeight, clientHeight} = scrollContainer.value;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !props.loading && props.hasMore) {
        emit('load-more', localSearchQuery.value);
      }
    }, 200);

    watch(() => props.searchQuery, (newQuery) => {
      if (newQuery !== localSearchQuery.value) {
        localSearchQuery.value = newQuery;
      }
    });

    onMounted(() => {
      if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll);
      }
    });

    onUnmounted(() => {
      if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', handleScroll);
      }
    });

    return {
      localSearchQuery,
      debouncedSearch,
      search,
      getSubjectName,
      getSubjectEmoji,
      scrollContainer,
      handleScroll
    };
  }
}
</script>
