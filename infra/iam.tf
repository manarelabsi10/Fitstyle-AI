# A dedicated IAM user with access ONLY to the 4 tables above -- this is what
# server.ts will authenticate as (via AWS SDK for JavaScript, using an access key
# in .env). It is NOT the same identity you use to run `terraform apply` -- that
# should be your own IAM admin user/profile, configured separately via `aws configure`.

data "aws_caller_identity" "current" {}

resource "aws_iam_user" "app_backend" {
  name = "${var.project_name}-backend"
}

resource "aws_iam_access_key" "app_backend" {
  user = aws_iam_user.app_backend.name
}

resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.project_name}-dynamodb-access"
  description = "Least-privilege DynamoDB access for the FitStyle AI Node backend"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.products.arn,
          aws_dynamodb_table.orders.arn,
          aws_dynamodb_table.measurements.arn,
        ]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "app_backend_dynamodb" {
  user       = aws_iam_user.app_backend.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}
