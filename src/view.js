import { subscribe } from 'valtio/vanilla';

const renderForm = (state, elements) => {
  const { input, feedback } = elements;

  switch (state.form.status) {
    case 'invalid':
      input.classList.add('is-invalid');
      feedback.textContent = state.form.error;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    case 'valid':
      input.classList.remove('is-invalid');
      input.value = '';
      input.focus();
      feedback.textContent = 'RSS успешно загружен';
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;
    default:
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      break;
  }
};

const initView = (state) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  subscribe(state, () => {
    renderForm(state, elements);
  });

  return elements;
};

export default initView;
