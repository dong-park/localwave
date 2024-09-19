<template>
  <div class="w-full h-full relative">
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Desktop filters -->
    <div class="absolute top-4 left-4 right-16 p-4 rounded bg-opacity-100 hidden md:block">
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

    <!-- Mobile bottom sheet filter trigger -->
    <div class="md:hidden">
      <button
          @click="$emit('open-bottom-sheet')"
          class="fixed top-4 left-4 z-10 items-center px-3 py-1 rounded-full text-sm border-2"
          :class="isFiltering ? 'bg-blue-500 text-white' : isDarkMode ? 'font-bold bg-gray-700 text-white' : 'font-bold bg-white text-gray-700'"
      >
        {{ filterButtonText }}
      </button>
    </div>

    <!-- Refresh button -->
    <div class="absolute bottom-4 left-0 right-0 flex justify-center" v-show="!isQuerySearch">
      <button
          v-if="mapMoved"
          @click="$emit('search-current-location')"
          class="px-4 py-2 rounded shadow flex items-center text-xs md:text-base"
          :class="{ 'bg-gray-800 text-blue-300': isDarkMode, 'bg-white text-blue-500': !isDarkMode }"
      >
        <span class="mr-2">🔄</span>
        현재 위치로 검색
      </button>
    </div>

    <!-- Current location button -->
    <button
        @click="$emit('get-current-location')"
        class="absolute bottom-4 right-4 p-2 bg-green-500 text-white rounded-full shadow text-xs md:text-base"
    >
      <span class="mr-1">📍</span>
      내 위치
    </button>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';

export default {
  name: 'MapView',
  props: {
    stores: Array,
    subjects: Array,
    selectedSubjects: Array,
    isDarkMode: Boolean,
    isQuerySearch: Boolean,
    mapMoved: Boolean,
  },
  emits: ['toggle-subject', 'open-bottom-sheet', 'search-current-location', 'get-current-location', 'map-init', 'map-moved'],
  setup(props, {emit}) {
    const mapContainer = ref(null);
    let map = null;

    const initMap = () => {
      const mapOptions = {
        center: new naver.maps.LatLng(37.4784, 126.9516),
        zoom: 16,
        minZoom: 15,
        zoomControl: false,
      };

      map = new naver.maps.Map(mapContainer.value, mapOptions);

      naver.maps.Event.addListener(map, 'dragend', () => {
        emit('map-moved');
      });

      naver.maps.Event.addListener(map, 'zoom_changed', () => {
        emit('map-moved');
      });

      emit('map-init', map);
    };

    const filterButtonText = computed(() => {
      if (props.selectedSubjects.length === 0) {
        return '필터';
      } else {
        const selectedSubject = props.subjects.find(s => s.subject_id === props.selectedSubjects[0]);
        return selectedSubject ? `${selectedSubject.emoji} ${selectedSubject.name}` : '필터';
      }
    });

    const isFiltering = computed(() => props.selectedSubjects.length !== 0);

    onMounted(() => {
      initMap();
    });

    watch(() => props.isDarkMode, (newValue) => {
      if (map) {
        const styles = newValue ? [
          {
            elementType: 'geometry',
            stylers: [{color: '#242f3e'}]
          },
          // ... (add more dark mode styles as needed)
        ] : [];
        map.setOptions({styles: styles});
      }
    });

    return {
      mapContainer,
      filterButtonText,
      isFiltering,
    };
  }
}
</script>
