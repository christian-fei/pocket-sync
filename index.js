#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const initPocket = require('./init-pocket')
const getPocketItems = require('./get-pocket-items')

const stateFolderPath = path.join(__dirname, 'state')
const pocketItemsFilePathJSON = path.join(stateFolderPath, 'synced.json')
const pocketItemsFilePathYML = path.join(stateFolderPath, 'synced.yml')

main(process.argv[2], process.argv[3])
.catch(err => { console.error(err); process.exit(1) })

async function main (POCKET_CONSUMER_KEY, POCKET_ACCESS_TOKEN) {
  if (!POCKET_CONSUMER_KEY) {
    process.stdout.write(helpText())
    process.stdout.write('\n')
    process.exit(1)
  }

  let synced = {}
  try {
    synced = fs.readFileSync(pocketItemsFilePathJSON, 'utf-8')
    synced = JSON.parse(synced)
  } catch (err) {
    try { fs.mkdirSync(stateFolderPath) } catch (errFolderExists) {}
    synced = { lastSynced: new Date().toISOString(), items: [] }
    fs.writeFileSync(pocketItemsFilePathJSON, JSON.stringify(synced, null, 2))
  }

  if (!POCKET_ACCESS_TOKEN) {
    POCKET_ACCESS_TOKEN = await initPocket(POCKET_CONSUMER_KEY)
  }

  let remotePocketItems = await getPocketItems(POCKET_CONSUMER_KEY, POCKET_ACCESS_TOKEN)

  // console.log(JSON.stringify(remotePocketItems, null, 2))
  console.log('synced items, remote items:', synced.items.length, remotePocketItems.length)

  const itemsToAdd = remotePocketItems.filter(newItems(synced.items))
  if (itemsToAdd.length === 0) {
    console.log('no new items to add')
  } else {
    console.log('items to add:\n', itemsToAdd.map(item => item.resolved_title).join('\n'), '\n')
    itemsToAdd.forEach(item => {
      console.log(`adding: "${item.resolved_title}" (${item.item_id}) -> ${item.resolved_url}`)
    })

    synced.items = synced.items.concat(itemsToAdd)
    synced.lastSynced = new Date().toISOString()
    fs.writeFileSync(pocketItemsFilePathJSON, JSON.stringify(synced, null, 2))
  }

  const asYML = synced.items.map(item => `
- title: "${item.resolved_title}"
  url: ${item.resolved_url}
  id: ${item.item_id}`.trim()).join('\n')
  fs.writeFileSync(pocketItemsFilePathYML, asYML)
}

function newItems (syncedItems) {
  const ids = syncedItems.map(i => i.item_id)
  return item => !ids.includes(item && item.item_id)
}

function helpText () {
  return `
usage:

pocket-sync <POCKET_CONSUMER_KEY> [POCKET_ACCESS_TOKEN]

👉  follow the documentation to obtain an access token: https://getpocket.com/developer/docs/authentication
`.trim()
}
