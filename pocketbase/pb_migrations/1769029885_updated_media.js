/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "deleteRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id = uploadedBy || @request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
