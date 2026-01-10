# One t3.micro running the docker compose stack, plus a security group.
# Usage:
#   cd deploy/terraform
#   cp terraform.tfvars.example terraform.tfvars   # fill in your values
#   terraform init && terraform plan && terraform apply

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
