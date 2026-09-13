# Cognito User Pools: Always Free for the first 50,000 Monthly Active Users.
# No IAM credentials needed for the frontend to use this -- the Amplify Auth SDK
# talks to Cognito directly using just the User Pool ID + Client ID (both public,
# safe to put in frontend env vars).

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  auto_verified_attributes = ["email"]

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # No client secret: this client is used from the browser (SPA), and a "secret"
  # embedded in frontend JS isn't actually secret. Cognito's public/SPA pattern.
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  supported_identity_providers = local.identity_providers
  callback_urls                = var.cognito_callback_urls
  logout_urls                  = var.cognito_logout_urls
  allowed_oauth_flows          = ["code"]
  allowed_oauth_scopes         = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  # Ensures Google (when present) exists before the client tries to reference it
  depends_on = [aws_cognito_identity_provider.google]
}
