const got = require('got')
const headers = { 'Content-Type': 'application/json', 'X-Accept': 'application/json' }

module.exports = async (POCKET_CONSUMER_KEY) => {
  const { body: oauthRequestBody } = await got.post('https://getpocket.com/v3/oauth/request', {
    headers,
    body: JSON.stringify({
      consumer_key: POCKET_CONSUMER_KEY,
      redirect_uri: 'localhost'
    })
  })

  const { code: POCKET_REQUEST_TOKEN } = JSON.parse(oauthRequestBody)

  // console.log('POCKET_REQUEST_TOKEN', POCKET_REQUEST_TOKEN)

  const POCKET_URL = `https://getpocket.com/auth/authorize?request_token=${POCKET_REQUEST_TOKEN}&redirect_uri=https://getpocket.com`

  process.stdout.write(`👉  Open the following url in a browser and log in with your pocket account: ${POCKET_URL}\n\n⚡️  (link will expire in 20 seconds)\n`)

  let authResponse
  let retries = 0

  do {
    try {
      authResponse = await authorize(POCKET_CONSUMER_KEY, POCKET_REQUEST_TOKEN)
    } catch (err) {
      retries++
      await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    }
  } while (retries < 20 && !authResponse)

  if (!authResponse) { return }

  const { access_token: POCKET_ACCESS_TOKEN } = JSON.parse(authResponse)

  return POCKET_ACCESS_TOKEN
}

async function authorize (POCKET_CONSUMER_KEY, POCKET_REQUEST_TOKEN) {
  const { body: oauthAuthorizeBody } = await got.post('https://getpocket.com/v3/oauth/authorize', {
    headers,
    body: JSON.stringify({
      consumer_key: POCKET_CONSUMER_KEY,
      code: POCKET_REQUEST_TOKEN
    })
  })

  return oauthAuthorizeBody
}

/*

curl "https://getpocket.com/v3/oauth/request" -H "Content-Type: application/json; charset=UTF-8" -H "X-Accept: application/json" --data '{"consumer_key":"POCKET_CONSUMER_KEY","redirect_uri":"localhost"}'

> {"code":"POCKET_REQUEST_TOKEN","state":null}

open "https://getpocket.com/auth/authorize?request_token=POCKET_REQUEST_TOKEN&redirect_uri=http://localhost:4000"

curl "https://getpocket.com/v3/oauth/authorize" -H "Content-Type: application/json; charset=UTF-8" -H "X-Accept: application/json" --data '{"consumer_key":"POCKET_CONSUMER_KEY","code":"POCKET_REQUEST_TOKEN"}'

> {"access_token":"POCKET_ACCESS_TOKEN","username":"XXX"}

curl "https://getpocket.com/v3/get" -H "Content-Type: application/json; charset=UTF-8" -H "X-Accept: application/json" --data '{"consumer_key":"POCKET_CONSUMER_KEY","access_token":"POCKET_ACCESS_TOKEN", "count": "10"}'

> {...}

*/
