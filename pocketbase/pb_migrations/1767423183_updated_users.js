/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "authToken": {
      "duration": 3600
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "authToken": {
      "duration": 604800
    }
  }, collection)

  return app.save(collection)
})
