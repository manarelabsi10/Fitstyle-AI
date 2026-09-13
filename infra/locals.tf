locals {
  # "COGNITO" (email/password) is always available. "Google" is added to the
  # list automatically once google_client_id is filled in -- no manual toggling.
  identity_providers = concat(
    ["COGNITO"],
    length(var.google_client_id) > 0 ? ["Google"] : []
  )
}
