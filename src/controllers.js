import axios from 'axios'
import parseRss from './parser.js'

const UPDATE_INTERVAL = 5000

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

const buildProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get')
  proxyUrl.searchParams.set('disableCache', 'true')
  proxyUrl.searchParams.set('url', url)
  return proxyUrl.toString()
}

const checkForUpdates = (state) => {
  const promises = state.feeds.map(feed => axios.get(buildProxyUrl(feed.url))
    .then((response) => {
      const { posts } = parseRss(response.data.contents)
      const existingLinks = state.posts
        .filter(post => post.feedId === feed.id)
        .map(post => post.link)
      const newPosts = posts
        .filter(post => !existingLinks.includes(post.link))
        .map(post => ({ id: generateId(), feedId: feed.id, ...post }))
      if (newPosts.length > 0) {
        state.posts.unshift(...newPosts)
      }
    })
    .catch(() => {}))

  Promise.allSettled(promises).finally(() => {
    setTimeout(() => checkForUpdates(state), UPDATE_INTERVAL)
  })
}

const startCheckingUpdates = (state) => {
  setTimeout(() => checkForUpdates(state), UPDATE_INTERVAL)
}

const loadFeed = (url, state) => {
  state.loadingProcess.status = 'loading'
  state.loadingProcess.error = null

  return axios.get(buildProxyUrl(url))
    .then((response) => {
      const { feed, posts } = parseRss(response.data.contents)
      const feedId = generateId()
      state.feeds.push({ id: feedId, url, ...feed })
      const normalizedPosts = posts.map(post => ({
        id: generateId(),
        feedId,
        ...post,
      }))
      state.posts.push(...normalizedPosts)
      state.loadingProcess.status = 'success'
    })
    .catch((err) => {
      state.loadingProcess.status = 'failed'
      if (err.isParsingError) {
        state.loadingProcess.error = 'noRss'
      }
      else if (err.isAxiosError) {
        state.loadingProcess.error = 'network'
      }
      else {
        state.loadingProcess.error = 'unknown'
      }
    })
}

export { loadFeed, startCheckingUpdates }
