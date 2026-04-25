const parseRss = (xml) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  if (doc.querySelector('parsererror') || !doc.querySelector('rss channel')) {
    const error = new Error('noRss')
    error.isParsingError = true
    throw error
  }

  const channel = doc.querySelector('channel')
  const feed = {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
  }

  const posts = [...channel.querySelectorAll('item')].map(item => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }))

  return { feed, posts }
}

export default parseRss
