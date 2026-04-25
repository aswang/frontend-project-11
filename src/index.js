import './styles.css';
import axios from 'axios';
import i18next from 'i18next';
import { proxy } from 'valtio/vanilla';
import * as yup from 'yup';
import ru from './locales/ru.js';
import parseRss from './parser.js';
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

const createSchema = (urls) => yup.string()
  .required()
  .url()
  .notOneOf(urls);

const UPDATE_INTERVAL = 5000;

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const buildProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const checkForUpdates = (state) => {
  const promises = state.feeds.map((feed) => axios.get(buildProxyUrl(feed.url))
    .then((response) => {
      const { posts } = parseRss(response.data.contents);
      const existingLinks = state.posts
        .filter((post) => post.feedId === feed.id)
        .map((post) => post.link);
      const newPosts = posts
        .filter((post) => !existingLinks.includes(post.link))
        .map((post) => ({ id: generateId(), feedId: feed.id, ...post }));
      if (newPosts.length > 0) {
        state.posts.unshift(...newPosts);
      }
    })
    .catch(() => {}));

  Promise.allSettled(promises).finally(() => {
    setTimeout(() => checkForUpdates(state), UPDATE_INTERVAL);
  });
};

const loadFeed = (url, state) => {
  state.loadingProcess.status = 'loading';
  state.loadingProcess.error = null;

  return axios.get(buildProxyUrl(url))
    .then((response) => {
      const { feed, posts } = parseRss(response.data.contents);
      const feedId = generateId();
      state.feeds.push({ id: feedId, url, ...feed });
      const normalizedPosts = posts.map((post) => ({
        id: generateId(),
        feedId,
        ...post,
      }));
      state.posts.push(...normalizedPosts);
      state.loadingProcess.status = 'success';
    })
    .catch((err) => {
      state.loadingProcess.status = 'failed';
      if (err.isParsingError) {
        state.loadingProcess.error = 'noRss';
      } else if (err.isAxiosError) {
        state.loadingProcess.error = 'network';
      } else {
        state.loadingProcess.error = 'unknown';
      }
    });
};

const app = () => {
  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    resources: { ru },
  }).then(() => {
    const state = proxy({
      form: {
        status: 'filling',
        error: null,
      },
      loadingProcess: {
        status: 'idle',
        error: null,
      },
      feeds: [],
      posts: [],
      ui: {
        seenPosts: [],
      },
    });

    const elements = initView(state, i18nextInstance);

    setTimeout(() => checkForUpdates(state), UPDATE_INTERVAL);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      const urls = state.feeds.map((feed) => feed.url);
      const schema = createSchema(urls);

      schema.validate(url)
        .then((validUrl) => {
          state.form.status = 'valid';
          state.form.error = null;
          return loadFeed(validUrl, state);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            state.form.status = 'invalid';
            state.form.error = err.message.key;
          }
        });
    });
  });
};

app();
