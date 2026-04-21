import { subscribe } from 'valtio/vanilla';

const renderForm = (state, elements, i18nextInstance) => {
  const { input, feedback } = elements;

  switch (state.form.status) {
    case 'invalid':
      input.classList.add('is-invalid');
      feedback.textContent = i18nextInstance.t(`errors.${state.form.error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    case 'valid':
      input.classList.remove('is-invalid');
      input.value = '';
      input.focus();
      feedback.textContent = i18nextInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;
    default:
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      break;
  }
};

const initView = (state, i18nextInstance) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  subscribe(state, () => {
    renderForm(state, elements, i18nextInstance);
  });

  return elements;
};

export default initView;
