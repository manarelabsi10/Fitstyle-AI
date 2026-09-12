# AWS DynamoDB Always Free tier = 25 GB storage + 25 Read Capacity Units + 25 Write
# Capacity Units, TOTAL PER ACCOUNT (not per table). PROVISIONED mode only --
# on-demand billing mode is NOT covered by the free tier and bills per request
# from the first request.
#
# Capacity budget across all 4 tables (must never exceed 25/25 combined):
#   Users        5 RCU / 5 WCU
#   Products    10 RCU / 5 WCU   (read far more than written -- browsing > admin edits)
#   Orders       5 RCU / 5 WCU
#   Measurements 5 RCU / 5 WCU
#   -----------------------------
#   TOTAL       25 RCU / 20 WCU   <- safely inside the 25/25 limit

resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-Users"
  billing_mode = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "products" {
  name         = "${var.project_name}-Products"
  billing_mode = "PROVISIONED"
  read_capacity  = 10
  write_capacity = 5
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "orders" {
  name         = "${var.project_name}-Orders"
  billing_mode = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "measurements" {
  name         = "${var.project_name}-Measurements"
  billing_mode = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}
