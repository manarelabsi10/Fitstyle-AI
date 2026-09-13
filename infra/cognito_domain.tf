# Cognito Hosted UI domain -- required for federated sign-in (Google).
# Domain prefixes must be globally unique across ALL AWS accounts worldwide.
# If `terraform apply` fails with "already exists", change cognito_domain_prefix
# in variables.tf to something more unique (add your name/random digits) and
# apply again.

resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}
