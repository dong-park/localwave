// src/composables/useStores.js
import { ref, computed } from 'vue';
import { supabase } from '@/composables/supabaseClient';

export function useStores() {
    const stores = ref([]);
    const currentPage = ref(1);
    const currentQuery = ref('');
    const pageSize = 30;
    const loading = ref(false);
    const error = ref(null);
    const totalCount = ref(0);
    const searchCoordinates = ref(null);
    const isQuerySearch = ref(false);

    const hasMore = computed(() => stores.value.length < totalCount.value);

    const searchStores = async (query = currentQuery, reset = true, useCoordinates = true, selectedSubjects = []) => {
        if (loading.value) return;

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

        const searchQueryParam = isQuerySearch.value ? query.trim() : '';
        currentQuery.value = searchQueryParam;

        try {
            const { data, error: searchError } = await supabase.functions.invoke('store-search', {
                body: JSON.stringify({
                    subjects: useCoordinates ? selectedSubjects : [], // TODO: Implement subject filtering
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
        } catch (err) {
            console.error('Error searching stores:', err);
            error.value = '가게 검색 중 오류가 발생했습니다.';
        } finally {
            loading.value = false;
        }
    };

    const loadMore = (selectedSubjects = []) => {
        currentPage.value++;
        searchStores(currentQuery, false, isQuerySearch.value, selectedSubjects);
    };

    const selectStore = (store) => {
        // TODO: Implement store selection logic
    };

    return {
        stores,
        searchStores,
        loadMore,
        selectStore,
        loading,
        error,
        totalCount,
        hasMore,
        isQuerySearch,
    };
}
