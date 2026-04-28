import './styles.css'
import { proxy } from 'valtio/vanilla'
import initI18n from './i18n.js'
import initView from './view.js'
import createSchema from './validator.js'
import { loadFeed, startCheckingUpdates } from './controllers.js'

const app = () => {
  initI18n().then((i18nextInstance) => {
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
    })

    const elements = initView(state, i18nextInstance)

    startCheckingUpdates(state)

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const url = formData.get('url').trim()

      const urls = state.feeds.map(feed => feed.url)
      const schema = createSchema(urls)

      schema.validate(url)
        .then((validUrl) => {
          state.form.status = 'valid'
          state.form.error = null
          return loadFeed(validUrl, state)
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            state.form.status = 'invalid'
            state.form.error = err.message.key
          }
        })
    })
  })
}

app()
