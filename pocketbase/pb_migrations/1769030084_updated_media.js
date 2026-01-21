/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "updateRule": ""
  }, collection)

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "users_collection",
    "hidden": false,
    "id": "relation4267303207",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "uploadedBy",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation4267303207")

  return app.save(collection)
})
