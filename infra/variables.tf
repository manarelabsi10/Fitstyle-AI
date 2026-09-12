variable "aws_region" {
  description = "AWS region to deploy into. Pick ONE region and stay on it -- DynamoDB free tier limits are per account, but mixing regions makes it harder to track what's running where."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used as a prefix for all resource names."
  type        = string
  default     = "fitstyle-ai"
}

variable "budget_alert_email" {
  description = "Email address to receive a warning the moment ANY AWS charge is incurred (budget threshold is $1)."
  type        = string
}

variable "cognito_callback_urls" {
  description = "URLs Cognito is allowed to redirect to after login (add your local dev URL and later your deployed URL)."
  type        = list(string)
  default     = ["http://localhost:5173"]
}
