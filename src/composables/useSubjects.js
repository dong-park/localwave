import { ref } from 'vue';

const CACHE_KEY = 'cachedSubjects';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function useSubjects() {
    const subjects = ref([]);
    const selectedSubjects = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const loadSubjects = async () => {
        if (loading.value) return;

        loading.value = true;
        error.value = null;

        try {
            // 로컬 캐시 확인
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

            if (cachedData && cacheTimestamp) {
                const parsedSubjects = JSON.parse(cachedData);
                const cacheAge = Date.now() - parseInt(cacheTimestamp);

                if (cacheAge < CACHE_EXPIRY) {
                    subjects.value = parsedSubjects;
                    loading.value = false;
                    return;
                }
            }

            // Express API 엔드포인트 호출
            const response = await axios.get('https://localwave-api.dongpark.dev/subject-list');
            const data = response.data;

            subjects.value = data.subjects;

            // 로컬 캐시 업데이트
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.subjects));
            localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
        } catch (err) {
            console.error('Error loading subjects:', err);
            error.value = '업종 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.';
        } finally {
            loading.value = false;
        }
    };

    const toggleSubject = (subjectId) => {
        const index = selectedSubjects.value.indexOf(subjectId);

        if (selectedSubjects.value[0] === subjectId) {
            selectedSubjects.value = [];
        }

        if (index === -1) {
            selectedSubjects.value = [];
            selectedSubjects.value.push(subjectId);
        }
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.value.find(s => s.subject_id === subjectId);
        return subject ? subject.name : '';
    };

    const getSubjectEmoji = (subjectId) => {
        const subject = subjects.value.find(s => s.subject_id === subjectId);
        return subject ? subject.emoji : '';
    };

    return {
        subjects,
        selectedSubjects,
        loading,
        error,
        loadSubjects,
        toggleSubject,
        getSubjectName,
        getSubjectEmoji
    };
}
