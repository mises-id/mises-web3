/*
 * @Author: lmk
 * @Date: 2021-07-07 23:23:36
 * @LastEditTime: 2022-08-17 17:59:41
 * @LastEditors: lmk
 * @Description: 
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './enUS.json'
const resources = {
  enUS
}

i18n.use(initReactI18next) // passes i18n down to react-i18next
.init({
  resources,
  fallbackLng:'enUS',
  lng: 'enUS',
  keySeparator: false, // we do not use keys in form messages.welcome

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})
export default i18n