import './styles.css';
import { proxy } from 'valtio/vanilla';
import * as yup from 'yup';
import initView from './view.js';

const createSchema = (feeds) => yup.string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL')
  .notOneOf(feeds, 'RSS уже существует');

const app = () => {
  const state = proxy({
    feeds: [],
    form: {
      status: 'filling',
      error: null,
    },
  });

  const elements = initView(state);

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
        state.form.error = err.message;
      });
  });
};

app();
