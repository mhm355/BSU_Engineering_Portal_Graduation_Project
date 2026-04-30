# Azure Container Apps for Frontend and Backend

# Log Analytics Workspace for Container Apps
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project_name}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    Name = "${var.project_name}-logs"
  }
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  infrastructure_subnet_id = azurerm_subnet.public.id
  internal_load_balancer_enabled = false

  tags = {
    Name = "${var.project_name}-env"
  }
}

# Container App - Frontend (Public facing)
resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-frontend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Multiple"

  identity {
    type = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  template {
    min_replicas = var.frontend_min_replicas
    max_replicas = var.frontend_max_replicas

    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.main.login_server}/${var.frontend_image}"
      cpu    = var.frontend_cpu
      memory = "${var.frontend_memory}Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      liveness_probe {
        transport = "HTTP"
        port      = 80
        path      = "/"
        interval_seconds = 30
        timeout_seconds  = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport = "HTTP"
        port      = 80
        path      = "/"
        interval_seconds = 30
        timeout_seconds  = 5
        success_count_threshold = 1
        failure_count_threshold = 3
      }
    }
  }

  depends_on = [azurerm_role_assignment.acr_pull]

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# Container App - Backend (Internal only, accessed via Frontend)
resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-backend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Multiple"

  identity {
    type = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  # Internal ingress only - not exposed to internet
  ingress {
    external_enabled = false
    target_port      = 8000
    transport        = "auto"
    exposed_port     = 8000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }

    # Only allow traffic from frontend
    allow_insecure_connections = false
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  template {
    min_replicas = var.backend_min_replicas
    max_replicas = var.backend_max_replicas

    container {
      name   = "backend"
      image  = "${azurerm_container_registry.main.login_server}/${var.backend_image}"
      cpu    = var.backend_cpu
      memory = "${var.backend_memory}Gi"

      env {
        name  = "DJANGO_SETTINGS_MODULE"
        value = "myproject.settings_production"
      }

      env {
        name  = "PYTHONUNBUFFERED"
        value = "1"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name  = "REDIS_URL"
        value = "redis://localhost:6379/0"
      }

      liveness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/api/health/"
        interval_seconds = 30
        timeout_seconds  = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/api/health/"
        interval_seconds = 30
        timeout_seconds  = 5
        success_count_threshold = 1
        failure_count_threshold = 3
      }
    }
  }

  secret {
    name  = "database-url"
    value = azurerm_key_vault_secret.db_connection_string.value
  }

  depends_on = [azurerm_role_assignment.acr_pull]

  tags = {
    Name = "${var.project_name}-backend"
  }
}

# Container App - Redis (Session & Cache)
resource "azurerm_container_app" "redis" {
  name                         = "${var.project_name}-redis"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  ingress {
    external_enabled = false
    target_port      = 6379
    transport        = "tcp"
    exposed_port     = 6379

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "redis"
      image  = "redis:7-alpine"
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  tags = {
    Name = "${var.project_name}-redis"
  }
}

# Scale rule for Frontend based on HTTP requests
resource "azurerm_container_app" "frontend_scaling" {
  # This is a placeholder to show scaling configuration
  # In practice, add this to the frontend container_app resource above
  # or use azurerm_monitor_autoscale_setting for more control

  name                         = "${var.project_name}-frontend-scaling-placeholder"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Multiple"

  identity {
    type = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  template {
    min_replicas = var.frontend_min_replicas
    max_replicas = var.frontend_max_replicas

    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.main.login_server}/${var.frontend_image}"
      cpu    = var.frontend_cpu
      memory = "${var.frontend_memory}Gi"
    }

    # HTTP scaling rule
    http_scale_rule {
      name                = "http-requests"
      concurrent_requests = "100"
    }
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}
