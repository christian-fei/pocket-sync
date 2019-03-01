module.exports = (item) => {
  return [
    `- title: "${(item.title || '').replace(/"/g, '\\"')}"\n`,
    `  url: ${item.url}\n`,
    `  date: ${item.date}\n`,
    `  id: ${item.id}`
  ].join('')
}
