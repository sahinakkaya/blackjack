import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';


i18next.use(initReactI18next).init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      game: en.game,
      form: en.form,
      copy: en.copy,
      notifications: en.notifications,
      timer: en.timer,
      translation: en,
    },
    tr: {
      game: tr.game,
      form: tr.form,
      copy: tr.copy,
      notifications: tr.notifications,
      timer: tr.timer,
      translation: tr,
    },
  },
  // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
  // set returnNull to false (and also in the i18next.d.ts options)
  // returnNull: false,
});
