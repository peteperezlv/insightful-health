/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_users_collection` ON `userz` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_users_collection` ON `userz` (`email`) WHERE `email` != ''"
    ],
    "name": "userz"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users_collection")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_users_collection` ON `usery` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_users_collection` ON `usery` (`email`) WHERE `email` != ''"
    ],
    "name": "usery"
  }, collection)

  return app.save(collection)
})
