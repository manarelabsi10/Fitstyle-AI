# Only created once you have real Google OAuth credentials (see README Phase 2).
# Until then, google_client_id defaults to "" and this resource is skipped
# entirely (count = 0) -- so the first `terraform apply` won't fail waiting on
# something you don't have yet.

resource "aws_cognito_identity_provider" "google" {
  count = length(var.google_client_id) > 0 ? 1 : 0

  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret     = var.google_client_secret
    authorize_scopes  = "email openid profile"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }
}
