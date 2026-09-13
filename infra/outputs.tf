output "dynamodb_table_names" {
  value = {
    users        = aws_dynamodb_table.users.name
    products     = aws_dynamodb_table.products.name
    orders       = aws_dynamodb_table.orders.name
    measurements = aws_dynamodb_table.measurements.name
  }
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_web_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "cognito_domain_url" {
  description = "Use this as the base for the Google OAuth redirect URI: <this>/oauth2/idpresponse"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "backend_aws_access_key_id" {
  value     = aws_iam_access_key.app_backend.id
  sensitive = true
}

output "backend_aws_secret_access_key" {
  value     = aws_iam_access_key.app_backend.secret
  sensitive = true
}

output "aws_region" {
  value = var.aws_region
}
