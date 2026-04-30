variable "azure_region" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
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

variable "vnet_cidr" {
  description = "CIDR block for Virtual Network"
  type        = string
  default     = "10.0.0.0/16"
}

variable "frontend_image" {
  description = "ACR image name for frontend container"
  type        = string
}

variable "backend_image" {
  description = "ACR image name for backend container"
  type        = string
}

variable "frontend_cpu" {
  description = "CPU cores for frontend container (0.5, 1, 1.5, 2, etc.)"
  type        = number
  default     = 0.5
}

variable "frontend_memory" {
  description = "Memory in Gi for frontend container"
  type        = number
  default     = 1.0
}

variable "backend_cpu" {
  description = "CPU cores for backend container"
  type        = number
  default     = 1.0
}

variable "backend_memory" {
  description = "Memory in Gi for backend container"
  type        = number
  default     = 2.0
}

variable "db_admin_username" {
  description = "Database administrator username"
  type        = string
  default     = "bsuadmin"
}

variable "db_sku_name" {
  description = "Azure Database for MySQL SKU"
  type        = string
  default     = "B_Standard_B1s"  # Burstable tier for dev
}

variable "db_storage_mb" {
  description = "Database storage in MB"
  type        = number
  default     = 32768  # 32 GB
}

variable "frontend_min_replicas" {
  description = "Minimum replicas for frontend"
  type        = number
  default     = 1
}

variable "frontend_max_replicas" {
  description = "Maximum replicas for frontend"
  type        = number
  default     = 3
}

variable "backend_min_replicas" {
  description = "Minimum replicas for backend"
  type        = number
  default     = 1
}

variable "backend_max_replicas" {
  description = "Maximum replicas for backend"
  type        = number
  default     = 3
}
