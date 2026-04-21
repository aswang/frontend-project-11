import './styles.css';
import i18next from 'i18next';
import { proxy } from 'valtio/vanilla';
import * as yup from 'yup';
import ru from './locales/ru.js';
import initView from './view.js';

yup.setLocale({
  mixed: {
    required: () => ({ key: 'required' }),
    notOneOf: () => ({ key: 'notOneOf' }),
  },
  string: {
    url: () => ({ key: 'url' }),
  },
});

const createSchema = (feeds) => yup.string()
  .required()
  .url()
  .notOneOf(feeds);

const app = () => {
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    resources: { ru },
  }).then(() => {
    const state = proxy({
      feeds: [],
      form: {
        status: 'filling',
        error: null,
      },
    });

    const elements = initView(state, i18nextInstance);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      const schema = createSchema(state.feeds);

      schema.validate(url)
        .then((validUrl) => {
          state.feeds.push(validUrl);
          state.form.status = 'valid';
          state.form.error = null;
        })
        .catch((err) => {
          state.form.status = 'invalid';
          state.form.error = err.message.key;
        });
    });
  });
};

app();
