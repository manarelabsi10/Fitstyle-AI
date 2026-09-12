terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Local state on purpose: this is a solo student project, not a team.
  # A remote backend (S3 + DynamoDB lock table) would itself consume storage/capacity
  # and add a moving part we don't need. The trade-off: terraform.tfstate lives on
  # your machine only, and it WILL contain the IAM access key generated below in
  # plaintext. Never commit it. See the .gitignore note in README.md.
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = "FitStyle-AI"
      Managed = "Terraform"
    }
  }
}
