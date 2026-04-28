import i18next from 'i18next'
import ru from './locales/ru.js'

const initI18n = () => {
  const i18nextInstance = i18next.createInstance()
  return i18nextInstance.init({
    lng: 'ru',
    resources: { ru },
  }).then(() => i18nextInstance)
}

export default initI18n
