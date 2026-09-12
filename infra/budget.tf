# Safety net: email the moment forecasted OR actual spend crosses $1.
# This does not stop charges from happening -- it just makes sure you find out
# immediately instead of at the end of the month.

resource "aws_budgets_budget" "zero_dollar_alert" {
  name              = "${var.project_name}-zero-dollar-alert"
  budget_type       = "COST"
  limit_amount      = "1"
  limit_unit        = "USD"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
