/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("analytics_collection")

  // Update viewRule to allow authors to view analytics
  // Authors can see all analytics (they will be filtered server-side by their posts)
  // Admins can see all analytics
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'author'"
  
  // Update listRule to allow authors to list analytics
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'author'"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("analytics_collection")

  // Revert to admin-only access
  collection.viewRule = "@request.auth.role = 'admin'"
  collection.listRule = "@request.auth.role = 'admin'"

  return app.save(collection)
})
