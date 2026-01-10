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
  type    = string
  default = "ap-southeast-1" # Singapore, closest to Manila
}

variable "key_name" {
  description = "Name of an existing EC2 key pair for SSH"
  type        = string
}

variable "ssh_cidr" {
  description = "Your own IP in CIDR form, e.g. 203.0.113.10/32. Never 0.0.0.0/0."
  type        = string
}

# latest Amazon Linux 2023 AMI, looked up instead of hard-coding an ID
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_security_group" "notes_api" {
  name        = "notes-api-sg"
  description = "HTTP from anywhere, SSH from my IP only"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
