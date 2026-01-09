/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "bool1547992806",
    "name": "emailVisibility",
    "presentable": true,
    "required": true,
    "system": true,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "bool1547992806",
    "name": "emailVisibility",
    "presentable": false,
    "required": false,
    "system": true,
    "type": "bool"
  }))

  return app.save(collection)
})
