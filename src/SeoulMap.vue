<template>
  <FloatingButtons
      :is-dark-mode="isDarkMode"
      @open-seoul-pay="openSeoulPay"
      @toggle-dark-mode="toggleDarkMode"
  />

  <div class="flex flex-col md:flex-row h-screen" :class="{ 'bg-gray-800': isDarkMode }">
    <div class="md:w-1/3 h-1/2 md:h-full flex flex-col order-2 md:order-1"
         :class="{ 'bg-gray-800': isDarkMode }">
      <StoreList
          :stores="stores"
          :loading="loading"
          :error="error"
          :total-count="totalCount"
          :has-more="hasMore"
          :is-dark-mode="isDarkMode"
          @search="handleSearch"
          @load-more="loadMore"
          @select-store="selectStore"
      />
    </div>

    <!-- Map area (full width on mobile, 2/3 on desktop) -->
    <div class="md:w-2/3 h-1/2 md:h-full relative order-1 md:order-2">
      <MapView
          :stores="stores"
          :subjects="subjects"
          :selected-subjects="selectedSubjects"
          :is-dark-mode="isDarkMode"
          :is-query-search="isQuerySearch"
          :map-moved="mapMoved"
          @toggle-subject="toggleSubject"
          @open-bottom-sheet="isBottomSheetOpen = true"
          @search-current-location="searchCurrentLocation"
          @get-current-location="getCurrentLocation"
          @map-init="handleMapInit"
          @map-moved="handleMapMoved"
      />
    </div>

    <!-- Mobile bottom sheet -->
    <MobileBottomSheet
        :is-open="isBottomSheetOpen"
        :is-dark-mode="isDarkMode"
        :subjects="subjects"
        :selected-subjects="selectedSubjects"
        @close="isBottomSheetOpen = false"
        @toggle-subject="toggleSubject"
    />
  </div>
</template>

<script>
import {ref, onMounted, computed, watch} from 'vue';
import {supabase} from '@/composables/supabaseClient';
import FloatingButtons from "@/components/FloatingButtons.vue";
import StoreList from "@/components/StoreList.vue";
import MapView from "@/components/MapView.vue";
import MobileBottomSheet from "@/components/MobileBottomSheet.vue";

export default {
  name: 'SeoulMap',
  components: {StoreList, FloatingButtons, MapView, MobileBottomSheet},
  setup() {
    const selectedSubjects = ref([]);
    const searchQuery = ref('');
    const stores = ref([]);
    const subjects = ref([]);
    const currentPage = ref(1);
    const pageSize = 30;
    const loading = ref(false);
    const error = ref(null);
    const totalCount = ref(0);
    const isBottomSheetOpen = ref(false);
    const isDarkMode = ref(false);
    const isQuerySearch = ref(false);
    const searchCoordinates = ref(null);
    const mapMoved = ref(false);
    const map = ref(null);
    const userMarker = ref(null);
    const markers = ref([]);
    const markerInfoWindows = ref(new Map());

    const hasMore = computed(() => stores.value.length < totalCount.value);

    const CACHE_KEY = 'cachedSubjects'
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

    const loadSubjects = async () => {
      if (loading.value) return;

      loading.value = true;
      error.value = null;

      try {
        // Check local cache
        const cachedData = localStorage.getItem(CACHE_KEY)
        const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`)

        if (cachedData && cacheTimestamp) {
          const parsedSubjects = JSON.parse(cachedData)
          const cacheAge = Date.now() - parseInt(cacheTimestamp)

          if (cacheAge < CACHE_EXPIRY) {
            subjects.value = parsedSubjects
            loading.value = false
            return
          }
        }

        // Call Supabase Function
        const {data, error: subjectsError} = await supabase.functions.invoke('subject-search', {
          body: JSON.stringify({
            // Add parameters if needed
          })
        });

        if (subjectsError) throw subjectsError;

        subjects.value = data.subjects;

        // Update local cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.subjects))
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString())

      } catch (err) {
        console.error('Error loading subjects:', err);
        error.value = '업종 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.';
      } finally {
        loading.value = false;
      }
    };

    const searchStores = async (query = '', reset = true, useCoordinates = true) => {
      if (!(query.length > 0 || selectedSubjects.value.length > 0)) return;

      loading.value = true;
      error.value = null;

      let latMin, latMax, lonMin, lonMax;
      if (useCoordinates && searchCoordinates.value) {
        ({latMin, latMax, lonMin, lonMax} = searchCoordinates.value);
      }

      if (reset) {
        stores.value = [];
        currentPage.value = 1;
      }

      const searchQueryParam = isQuerySearch.value ? query : '';
      try {
        const {data, error: searchError} = await supabase.functions.invoke('store-search', {
          body: JSON.stringify({
            subjects: useCoordinates ? selectedSubjects.value : null,
            query: searchQueryParam,
            page: currentPage.value,
            latMin,
            latMax,
            lonMin,
            lonMax,
            pageSize,
            useCoordinates: useCoordinates && !isQuerySearch.value
          })
        });

        if (searchError) throw searchError;

        stores.value = reset ? data.stores : [...stores.value, ...data.stores];
        totalCount.value = data.count;
        updateMarkers(data.stores, reset);
      } catch (err) {
        console.error('Error searching stores:', err);
        error.value = '가게 검색 중 오류가 발생했습니다.';
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = (query = '') => {
      const useCoordinates = query.length === 0;
      isQuerySearch.value = query.length > 0;
      searchStores(query, true, useCoordinates);
    };

    const loadMore = (query) => {
      currentPage.value++;
      searchStores(query, false, !isQuerySearch.value);
    };

    const toggleSubject = (subjectId) => {
      const index = selectedSubjects.value.indexOf(subjectId);

      if (selectedSubjects.value[0] === subjectId) {
        selectedSubjects.value = [];
      } else if (index === -1) {
        selectedSubjects.value = [subjectId];
      }

      if (selectedSubjects.value.length > 0) {
        isQuerySearch.value = false;
        searchStores('', true, true);
      }

      // Close bottom sheet on mobile after filter selection
      isBottomSheetOpen.value = false;
    };

    const selectStore = (store) => {
      const position = new naver.maps.LatLng(store.latitude, store.longitude);
      map.value.setCenter(position);

      const marker = markers.value.find(m =>
          m.getPosition().lat() === store.latitude &&
          m.getPosition().lng() === store.longitude
      );

      if (marker) {
        showInfoWindow(marker);
      }
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
    };

    const openSeoulPay = () => {
      window.open('https://github.com/dong-park/localwave')
    };

    const handleMapInit = (mapInstance) => {
      map.value = mapInstance;
      getCurrentLocation();
    };

    const handleMapMoved = () => {
      mapMoved.value = true;
    };

    const updateMarkers = (newStores, reset) => {
      if (reset) {
        markers.value.forEach(marker => {
          marker.setMap(null);
          if (markerInfoWindows.value.has(marker)) {
            markerInfoWindows.value.get(marker).close();
            markerInfoWindows.value.delete(marker);
          }
        });
        markers.value = [];
      }

      newStores.forEach(store => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(store.latitude, store.longitude),
          map: map.value
        });

        const infoWindowContent = `
      <div class="info-window p-2 pl-10 border rounded w-full cursor-pointer" style="padding: 10px; position: relative;">
        <h3 class="" style="margin-bottom: 5px;">${getSubjectEmoji(store.subject_id)} ${store.title}</h3>
        <p class="text-sm" style="margin-bottom: 5px;">${store.address}</p>
      </div>
    `;

        const infoWindow = new naver.maps.InfoWindow({
          content: infoWindowContent,
          borderWidth: 0,
          anchorSize: new naver.maps.Size(0, 0),
          pixelOffset: new naver.maps.Point(0, -10)
        });

        markerInfoWindows.value.set(marker, infoWindow);

        naver.maps.Event.addListener(marker, 'click', () => {
          showInfoWindow(marker);
        });

        naver.maps.Event.addListener(infoWindow, 'open', () => {
          const closeBtn = infoWindow.contentElement;
          if (closeBtn) {
            closeBtn.onclick = () => {
              infoWindow.close();
            };
          }
        });

        markers.value.push(marker);
      });
    };

    const showInfoWindow = (marker) => {
      markerInfoWindows.value.forEach((infoWindow, m) => {
        if (m !== marker) {
          infoWindow.close();
        }
      });

      if (markerInfoWindows.value.has(marker)) {
        const infoWindow = markerInfoWindows.value.get(marker);
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map.value, marker);
        }
      }
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
              const {latitude, longitude} = position.coords;
              const newCenter = new naver.maps.LatLng(latitude, longitude);
              map.value.setCenter(newCenter);
              mapMoved.value = false;

              if (userMarker.value) {
                userMarker.value.setPosition(newCenter);
              } else {
                userMarker.value = new naver.maps.Marker({
                  position: newCenter,
                  map: map.value,
                  icon: {
                    content: '<div style="background-color:blue;width:20px;height:20px;border-radius:50%;"></div>',
                    anchor: new naver.maps.Point(10, 10)
                  }
                });
              }

              searchCurrentLocation();
            },
            (error) => {
              console.error("Geolocation error:", error);
              alert("현재 위치를 가져올 수 없습니다. 권한을 확인해주세요.");
            }
        );
      } else {
        alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      }
    };

    const searchCurrentLocation = () => {
      mapMoved.value = false;
      const bounds = map.value.getBounds();
      const southWest = bounds.getSW();
      const northEast = bounds.getNE();
      searchCoordinates.value = {
        latMin: southWest.lat(),
        latMax: northEast.lat(),
        lonMin: southWest.lng(),
        lonMax: northEast.lng()
      };
      searchStores('', true, true);
    };

    const getSubjectEmoji = (subjectId) => {
      const subject = subjects.value.find(s => s.subject_id === subjectId);
      return subject ? subject.emoji : '';
    };

    onMounted(() => {
      loadSubjects();
    });

    watch(() => stores.value, (newStores) => {
      updateMarkers(newStores, true);
    });

    return {
      selectedSubjects,
      searchQuery,
      stores,
      subjects,
      loading,
      error,
      hasMore,
      totalCount,
      isBottomSheetOpen,
      isDarkMode,
      isQuerySearch,
      mapMoved,
      handleSearch,
      toggleSubject,
      loadMore,
      selectStore,
      toggleDarkMode,
      openSeoulPay,
      searchStores,
      handleMapInit,
      handleMapMoved,
      getCurrentLocation,
      searchCurrentLocation
    };
  }
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.dark {
  @apply bg-gray-900 text-white;
}
</style>
