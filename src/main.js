import { createApp } from 'vue'
import App from './App.vue'
/*import FondoTitulos from './components/FondoTitulos.vue'*/
 
if('servicveWorker' in navigator){
    window.addEventListener('load', async ()=>{
        try{
            const registro = await navigator.serviceWorker.register(
                `${import.meta.env.BASE_URL}sw.js`
            )
            console.log('service Worker registrado:', registro.scope)
        } catch (error) {
            console.error('Error al registrar el service worker:', error)
        }
    })
}
 
createApp(App).mount('#app')