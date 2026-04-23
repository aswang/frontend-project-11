import { subscribe } from 'valtio/vanilla';

const renderForm = (state, elements, i18nextInstance) => {
  const { input, feedback } = elements;

  if (state.form.status === 'invalid') {
    input.classList.add('is-invalid');
    feedback.textContent = i18nextInstance.t(`errors.${state.form.error}`);
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    return;
  }

  input.classList.remove('is-invalid');
};

const renderLoadingProcess = (state, elements, i18nextInstance) => {
  const { input, submit, feedback } = elements;

  switch (state.loadingProcess.status) {
    case 'loading':
      input.setAttribute('readonly', true);
      submit.setAttribute('disabled', true);
      feedback.textContent = '';
      feedback.classList.remove('text-danger', 'text-success');
      break;
    case 'success':
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled');
      input.value = '';
      input.focus();
      feedback.textContent = i18nextInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;
    case 'failed':
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled');
      feedback.textContent = i18nextInstance.t(`errors.${state.loadingProcess.error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    default:
      break;
  }
};

const buildCard = (titleText) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = titleText;
  cardBody.append(title);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  card.append(cardBody, list);
  return { card, list };
};

const renderFeeds = (state, elements) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
  if (state.feeds.length === 0) return;

  const { card, list } = buildCard('Фиды');

  state.feeds.forEach((feed) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    item.append(title, description);
    list.append(item);
  });

  feedsContainer.append(card);
};

const renderPosts = (state, elements) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
  if (state.posts.length === 0) return;

  const { card, list } = buildCard('Посты');

  state.posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = 'Просмотр';

    item.append(link, button);
    list.append(item);
  });

  postsContainer.append(card);
};

const initView = (state, i18nextInstance) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  subscribe(state, () => {
    renderForm(state, elements, i18nextInstance);
    renderLoadingProcess(state, elements, i18nextInstance);
    renderFeeds(state, elements);
    renderPosts(state, elements);
  });

  return elements;
};

export default initView;
