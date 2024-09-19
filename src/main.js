import { createApp } from 'vue'
import App from './App.vue'

function loadNaverMapsScript() {
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_MAPS_CLIENT_ID}&submodules=geocoder`
    script.async = true
    document.head.appendChild(script)

    return new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
    })
}

loadNaverMapsScript().then(() => {
    createApp(App).mount('#app')
}).catch((error) => {
    console.error('Failed to load Naver Maps script:', error)
})
