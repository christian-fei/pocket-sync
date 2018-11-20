#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const initPocket = require('./init-pocket')
const getPocketItems = require('./get-pocket-items')

const stateFolderPath = path.join(__dirname, 'state')
const pocketItemsFilePath = path.join(stateFolderPath, 'synced.json')
const { POCKET_CONSUMER_KEY } = require('./secrets.json')

main(process.argv.slice(2)[0])
.catch(err => { console.error(err); process.exit(1) })

async function main (POCKET_ACCESS_TOKEN) {
  if (!POCKET_CONSUMER_KEY) {
    console.error('💥  please set POCKET_CONSUMER_KEY in secrets.json or pass as an argument')
    process.exit(1)
  }

  let synced = {}
  try {
    synced = fs.readFileSync(pocketItemsFilePath, 'utf-8')
    synced = JSON.parse(synced)
  } catch (err) {
    try { fs.mkdirSync(stateFolderPath) } catch (errFolderExists) {}
    synced = { lastSynced: new Date().toISOString(), items: [] }
    fs.writeFileSync(pocketItemsFilePath, JSON.stringify(synced, null, 2))
  }

  if (!POCKET_ACCESS_TOKEN) {
    POCKET_ACCESS_TOKEN = await initPocket(POCKET_CONSUMER_KEY)
  }

  let remotePocketItems = await getPocketItems(POCKET_ACCESS_TOKEN)

  // console.log(JSON.stringify(remotePocketItems, null, 2))
  console.log('synced items, remote items:', synced.items.length, remotePocketItems.length)

  const itemsToAdd = remotePocketItems.filter(newItems(synced.items))
  if (itemsToAdd.length === 0) {
    console.log('no new items to add')
    process.exit(0)
  }

  console.log('items to add:\n', itemsToAdd.map(item => item.resolved_title).join('\n'))
  itemsToAdd.forEach(item => {
    console.log(`adding: "${item.resolved_title}" (${item.item_id}) -> ${item.resolved_url}`)
  })

  synced.items = synced.items.concat(itemsToAdd)
  synced.lastSynced = new Date().toISOString()
  fs.writeFileSync(pocketItemsFilePath, JSON.stringify(synced, null, 2))
}

function newItems (syncedItems) {
  const ids = syncedItems.map(i => i.item_id)
  return item => !ids.includes(item && item.item_id)
}
