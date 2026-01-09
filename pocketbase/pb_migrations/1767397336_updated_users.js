/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "viewRule": "@request.auth.id = id || @request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
