variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bsu-engineering-portal"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

variable "frontend_image" {
  description = "ECR image URI for frontend container"
  type        = string
}

variable "backend_image" {
  description = "ECR image URI for backend container"
  type        = string
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task (MiB)"
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "CPU units for backend task (512 = 0.5 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend task (MiB)"
  type        = number
  default     = 1024
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "bsu_admin"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "desired_count_frontend" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
}

variable "desired_count_backend" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "use_nat_gateway" {
  description = "Use NAT Gateway (true) or VPC Endpoints (false for cost savings)"
  type        = bool
  default     = true
}
