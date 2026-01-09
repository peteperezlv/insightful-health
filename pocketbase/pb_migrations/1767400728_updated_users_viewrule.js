/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  // Update viewRule to allow admins to view all user fields including email
  // This is necessary for the admin dashboard user management page
  // Admins need to see email addresses for all users
  collection.viewRule = "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.verified = true"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  // Revert to previous viewRule (without admin check)
  collection.viewRule = "id = @request.auth.id || @request.auth.verified = true"

  return app.save(collection)
})
